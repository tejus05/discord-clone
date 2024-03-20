import prisma from "@/db";
import { currentProfile } from "@/lib/currentProfile";
import { DirectMessage } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export async function GET(request: NextRequest) {
  try {

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 });

    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) return new NextResponse("Channel ID Missing", { status: 401 });

    let messages: DirectMessage[] = [];

    if (cursor) {
      messages = await prisma.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor
        },
        where: {
          conversationId
        },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }
    else {
      messages = await prisma.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId
        },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    } //10 messages -> make 9th one as cursor 

    return NextResponse.json({
      items: messages,
      nextCursor
    })

  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}