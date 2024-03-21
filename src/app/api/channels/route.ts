import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";
import { MemberRole } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {

    const { name, type } = await request.json();

    const profile = await currentProfile();

    const { searchParams } = new URL(request.url);
    
    const serverId = searchParams.get("serverId");

    if (!profile) return new NextResponse("Unauthorised", { status: 401 });

    if (!serverId) return new NextResponse("Server ID Missing", { status: 400 });

    if (name === "general") return new NextResponse("Name cannot be 'general'", { status: 400 });

    await pusherServer.trigger(toPusherKey(`server:${serverId}:channel:create`), "channel-create", true);

    const server = await prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      data: {
        channels: {
          create: {
            name,
            type,
            profileId: profile.id
          }
        }
      }
    })

    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}