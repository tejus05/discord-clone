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
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) return new NextResponse("Unauthorised", { status: 401 });
    
    if (!serverId) return new NextResponse("Server ID Missing", { status: 400 });

    if (!channelId) return new NextResponse("Channel ID Missing", { status: 400 });
    
    if (!content) return new NextResponse("Content ID Missing", { status: 400 });

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

    if (!server) return new NextResponse("Server Not found", { status: 404 });
    
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        serverId
      }
    })
    
    if (!channel) return new NextResponse("Channel Not found", { status: 404 });

    const member = server.members.find(member => member.profileId === profile.id);
    
    
    if (!member) return new NextResponse("Member Not found", { status: 404 });

    const message = await prisma.message.create({
      data: {
        content,
        fileUrl,
        channelId,
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

    const channelKey = toPusherKey(`chat:${channelId}:messages`);

    pusherServer.trigger(channelKey, "create-message",message);

    return NextResponse.json(message);

  } catch (error) {
    console.log("[MESSAGES_POST]",error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}