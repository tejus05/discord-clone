import prisma from "@/db";
import { currentProfile } from "@/lib/currentProfile";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: {
    directMessageId: string
  }
}

export async function PATCH(request: NextRequest, { params: { directMessageId } }: Props) {
  try {

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 })

    const { content } = await request.json();

    const { searchParams } = new URL(request.url);

    const conversationId = searchParams.get('conversationId');

    if (!conversationId) return new NextResponse("Conversation ID Missing", { status: 400 })
    if (!directMessageId) return new NextResponse("Direct Message ID Missing", { status: 400 })

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
          },
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

    if (!conversation) return new NextResponse("No such conversation exists", { status: 404 })

    const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

    if (!member) return new NextResponse("No such member exists", { status: 404 })

    let directMessage = await prisma.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!directMessage || directMessage.deleted) return new NextResponse("No such message exists", { status: 404 })

    const isMessageOwner = directMessage.memberId === member.id;

    const isAdmin = member.role === "ADMIN"
    const isModerator = member.role === "MODERATOR"
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) return new NextResponse("Unauthorised", { status: 401 })

    if (!isMessageOwner) {
      return new NextResponse("Unauthorised", { status: 401 })
    }
    directMessage = await prisma.directMessage.update({
      where: {
        id: directMessageId
      },
      data: {
        content
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    const updatedKey = toPusherKey(`chat:${conversation.id}:messages:update`);

    await pusherServer.trigger(updatedKey, "update-message", directMessage);

    return NextResponse.json(directMessage);

  } catch (error) {
    console.log("[DIRECT_MESSAGES_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params: { directMessageId } }: Props) {
  try {

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 })

    const { searchParams } = new URL(request.url);

    const conversationId = searchParams.get('conversationId');

    if (!conversationId) return new NextResponse("Conversation ID Missing", { status: 400 })
    if (!directMessageId) return new NextResponse("Direct Message ID Missing", { status: 400 })

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
          },
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

    if (!conversation) return new NextResponse("No such conversation exists", { status: 404 })

    const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

    if (!member) return new NextResponse("No such member exists", { status: 404 })

    let directMessage = await prisma.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!directMessage || directMessage.deleted) return new NextResponse("No such message exists", { status: 404 })

    
    const isAdmin = member.role === "ADMIN"
    const isModerator = member.role === "MODERATOR"
    const isMessageOwner = directMessage.memberId === member.id || isAdmin;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) return new NextResponse("Unauthorised", { status: 401 })

    if (!isMessageOwner) {
      return new NextResponse("Unauthorised", { status: 401 })
    }
    directMessage = await prisma.directMessage.update({
      where: {
        id: directMessageId
      },
      data: {
        fileUrl: null,
        content: "This message has been deleted",
        deleted: true
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    const updatedKey = toPusherKey(`chat:${conversation.id}:messages:update`);

    await pusherServer.trigger(updatedKey, "update-message", directMessage);

    return NextResponse.json(directMessage);

  } catch (error) {
    console.log("[DIRECT_MESSAGES_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}