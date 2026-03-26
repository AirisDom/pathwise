import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/messages — List conversations grouped by thread
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all messages involving this user
    const messages = await db.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, image: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by threadId (or by the other participant if no threadId)
    const threadMap = new Map<
      string,
      {
        threadId: string;
        otherUser: { id: string; name: string | null; image: string | null; role: string };
        lastMessage: { content: string; createdAt: Date; senderId: string };
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      const threadKey = msg.threadId || [userId, otherUser.id].sort().join("-");

      if (!threadMap.has(threadKey)) {
        threadMap.set(threadKey, {
          threadId: threadKey,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image,
            role: otherUser.role,
          },
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          },
          unreadCount: 0,
        });
      }

      // Count unread messages received by this user
      if (msg.receiverId === userId && !msg.isRead) {
        const thread = threadMap.get(threadKey)!;
        thread.unreadCount++;
      }
    }

    const conversations = Array.from(threadMap.values()).sort(
      (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Messages list error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/messages — Send a message
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { receiverId, content, subject, threadId } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content are required" },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });
    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    // Generate threadId if not provided
    const finalThreadId = threadId || [userId, receiverId].sort().join("-");

    const message = await db.message.create({
      data: {
        senderId: userId,
        receiverId,
        content,
        subject: subject || null,
        threadId: finalThreadId,
      },
    });

    // Create notification for receiver
    const senderName = session.user.name || "Someone";
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "NEW_MESSAGE",
        title: "New Message",
        message: `${senderName} sent you a message`,
        link: receiver.id === userId ? "/CreatorMessages" : "/StudentMessages",
      },
    });

    return NextResponse.json({ message, threadId: finalThreadId }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
