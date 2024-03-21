import prisma from "@/db";
import { currentProfile } from "@/lib/currentProfile";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const profile = await currentProfile();
    const { content, fileUrl } = await request.json();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!profile) return new NextResponse("Unauthorised", { status: 401 });

    if (!conversationId) return new NextResponse("Conversation ID Missing", { status: 400 });

    if (!content) return new NextResponse("Content ID Missing", { status: 400 });

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id
            }
          },
          {
            memberTwo: {
              profileId: profile.id
            }
          }
        ]
      },
      include: {
        memberOne: {
          include: {
            profile: true
          }
        },
        memberTwo: {
          include: {
            profile: true
          }
        },
      }
    })

    if (!conversation) return new NextResponse("Conversation not found", { status: 404 });

    const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

    if (!member) return new NextResponse("Member not found", { status: 404 });

    const message = await prisma.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversationId as string,
        memberId: member.id
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    const channelKey = toPusherKey(`chat:${conversationId}:messages`);

    pusherServer.trigger(channelKey, "create-message", message);

    return NextResponse.json(message);

  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}