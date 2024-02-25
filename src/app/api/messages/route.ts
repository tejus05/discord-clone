import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";
import { Message } from "@prisma/client";

const MESSAGES_BATCH = 10;

export async function GET(request: NextRequest) {
  try {

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 });

    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!channelId) return new NextResponse("Channel ID Missing", { status: 401 });

    let messages: Message[] = [];

    if (cursor) {
      messages = await prisma.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor
        },
        where: {
          channelId
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
    else{
      messages = await prisma.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          channelId
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
    console.log("[MESSAGES_GET]",error)
    return new NextResponse("Internal Error",{status:500});
  }
}