import prisma from "@/db";
import { currentProfile } from "@/lib/currentProfile";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: {
    messageId: string
  }
}


export async function PATCH(request: NextRequest, { params: { messageId } }: Props) {
  try {

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 })

    const { content } = await request.json();

    const { searchParams } = new URL(request.url);

    const serverId = searchParams.get('serverId');
    const channelId = searchParams.get('channelId');

    if (!serverId) return new NextResponse("Server ID Missing", { status: 400 })
    if (!channelId) return new NextResponse("Channel ID Missing", { status: 400 })

    const server = await prisma.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      include: {
        members: true
      }
    })

    if (!server) return new NextResponse("No such server exists", { status: 404 })

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        serverId
      }
    })

    if (!channel) return new NextResponse("No such channel exists", { status: 404 })

    const member = server.members.find(member => member.profileId === profile.id)

    if (!member) return new NextResponse("No such member exists", { status: 404 })

    let message = await prisma.message.findFirst({
      where: {
        id: messageId
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!message || message.deleted) return new NextResponse("No such message exists", { status: 404 })

    const isMessageOwner = message.memberId === member.id;

    const isAdmin = member.role === "ADMIN"
    const isModerator = member.role === "MODERATOR"
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) return new NextResponse("Unauthorised", { status: 401 })

    if (!isMessageOwner) {
      return new NextResponse("Unauthorised", { status: 401 })
    }
    message = await prisma.message.update({
      where: {
        id: messageId
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

    const updatedKey = toPusherKey(`chat:${channelId}:messages:update`);

    await pusherServer.trigger(updatedKey, "update-message", message);

    return NextResponse.json(message);

  } catch (error) {
    console.log("[MESSAGES_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params: { messageId } }: Props) {
  try {

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 })

    const { searchParams } = new URL(request.url);

    const serverId = searchParams.get('serverId');
    const channelId = searchParams.get('channelId');

    if (!serverId) return new NextResponse("Server ID", { status: 400 })
    if (!channelId) return new NextResponse("Channel ID", { status: 400 })

    const server = await prisma.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      include: {
        members: true
      }
    })

    if (!server) return new NextResponse("No such server exists", { status: 404 })

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        serverId
      }
    })

    if (!channel) return new NextResponse("No such channel exists", { status: 404 })

    const member = server.members.find(member => member.profileId === profile.id)

    if (!member) return new NextResponse("No such member exists", { status: 404 })

    let message = await prisma.message.findFirst({
      where: {
        id: messageId
      },
      include: {
        member: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!message || message.deleted) return new NextResponse("No such message exists", { status: 404 })

    const isMessageOwner = message.memberId === member.id;

    const isAdmin = member.role === "ADMIN"
    const isModerator = member.role === "MODERATOR"
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) return new NextResponse("Unauthorised", { status: 401 })

    message = await prisma.message.update({
      where: {
        id: messageId
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

    const updatedKey = toPusherKey(`chat:${channelId}:messages:update`);

    await pusherServer.trigger(updatedKey, "update-message", message);

    return NextResponse.json(message);

  } catch (error) {
    console.log("[MESSAGES_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}