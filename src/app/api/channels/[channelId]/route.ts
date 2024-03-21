import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface Props{
  params: {
    channelId: string
  }
}

export async function DELETE(request: NextRequest, {params: {channelId}}:Props) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", {
      status: 401
    });

    const { searchParams } = new URL(request.url);   
    const serverId = searchParams.get("serverId");
    if (!serverId) return new NextResponse("Server ID Missing", {
      status: 400
    });
    if (!channelId) return new NextResponse("Channel ID Missing", {
      status: 400
    });

    
    const server = await prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: ["ADMIN","MODERATOR"]
            }
          }
        }
      },
      data: {
        channels: {
          delete: {
            id: channelId,
            name: {
              not: "general"
            }
          }
        }
      }
    })
    
    await pusherServer.trigger(toPusherKey(`server:${serverId}:channel:delete`), "channel-delete", true);
    
    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNEL_ID_DELETE]",error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: NextRequest, {params: {channelId}}:Props) {
  try {

    const { name, type } = await request.json();

    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorised", {
      status: 401
    });

    const { searchParams } = new URL(request.url);   

    const serverId = searchParams.get("serverId");

    if (!serverId) return new NextResponse("Server ID Missing", {
      status: 400
    });

    if (!channelId) return new NextResponse("Channel ID Missing", {
      status: 400
    });

    if (name === "general") return new NextResponse("Name cannot be 'general'", { status: 400 });

    
    const server = await prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: ["ADMIN","MODERATOR"]
            }
          }
        }
      },
      data: {
        channels: {
          update: {
            where: {
              id: channelId,
              name: {
                not: "general"
              }
            },
            data: {
              name,
              type
            }
          }
        }
      }
    })

    await pusherServer.trigger(toPusherKey(`server:${serverId}:channel:update`), "channel-update", true);
    
    return NextResponse.json(server);
  } catch (error) {
    console.log(["CHANNEL_ID_PATCH"],error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}