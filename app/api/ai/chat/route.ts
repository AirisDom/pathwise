import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

  // Validate messages have correct roles
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
- If you're not sure about something specific to the course content, be honest about it
- Keep your responses focused and practical — students want to learn, not read essays
- If a student seems stuck or frustrated, offer encouragement and a different angle

Stay focused on helping students learn effectively. You're their study companion for this course.`;

  try {
    // Use the streaming API with async generator pattern
    const anthropicStream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: validMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
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
    // Give meaningful errors back to the client
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Unknown error";

    if (message.includes("credit balance is too low")) {
      return Response.json(
        { error: "Lumi is out of credits. Please top up the Anthropic account to continue." },
        { status: 503 }
      );
    }
    if (message.includes("invalid_api_key") || message.includes("401")) {
      return Response.json(
        { error: "Lumi API key is invalid. Please check the ANTHROPIC_API_KEY in .env." },
        { status: 503 }
      );
    }
    return Response.json(
      { error: "Lumi is temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
