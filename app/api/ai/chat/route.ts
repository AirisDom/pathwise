import { auth } from "@/lib/auth";

const OLLAMA_URL = "http://localhost:11434/api/chat";

export async function POST(req: Request) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    courseContext: {
      courseTitle: string;
      lessonTitle: string | null;
      lessonType: string | null;
    };
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, courseContext } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Messages are required" }, { status: 400 });
  }

  const validMessages = messages.filter(
    (m) => m.role === "user" || m.role === "assistant"
  );
  if (validMessages.length === 0) {
    return Response.json({ error: "No valid messages" }, { status: 400 });
  }

  const systemPrompt = `You are Lumi, a friendly and encouraging AI study assistant for PathWise, an online learning platform.

You are currently helping a student with the following:
- Course: ${courseContext.courseTitle}${courseContext.lessonTitle ? `\n- Current Lesson: ${courseContext.lessonTitle}` : ""}${courseContext.lessonType ? `\n- Lesson Type: ${courseContext.lessonType}` : ""}

Your personality and guidelines:
- Be warm, friendly, and encouraging — like a knowledgeable study buddy who genuinely wants the student to succeed
- Explain concepts clearly with relatable real-world examples
- Break down complex topics into simple, digestible steps
- When answering questions about the lesson, be thorough but concise — avoid walls of text
- Use markdown formatting where helpful: bullet points for lists, \`code blocks\` for code, **bold** for emphasis
- After answering, sometimes ask a follow-up like "Does that make sense?" or "Would you like me to go deeper on any part?"
- Celebrate curiosity and effort — if a student asks a good question, acknowledge it
- If you're not sure about something, be honest about it
- Keep your responses focused and practical — students want to learn, not read essays
- If a student seems stuck or frustrated, offer encouragement and a different angle

Stay focused on helping students learn effectively. You're their study companion for this course.`;

  try {
    const ollamaRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [
          { role: "system", content: systemPrompt },
          ...validMessages,
        ],
        stream: true,
      }),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      throw new Error(`Ollama returned ${ollamaRes.status}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const upstream = ollamaRes.body;

    const readable = new ReadableStream({
      async start(controller) {
        const reader = upstream.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const json = JSON.parse(line);
                const text = json?.message?.content;
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                // skip malformed lines
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("[LUMI_CHAT_ERROR]", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Unknown error";

    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      return Response.json(
        { error: "Lumi is offline. Make sure Ollama is running (`brew services start ollama`)." },
        { status: 503 }
      );
    }
    return Response.json(
      { error: "Lumi is temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
