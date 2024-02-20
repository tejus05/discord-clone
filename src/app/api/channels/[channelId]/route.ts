import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";

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

    return NextResponse.json(server);
  } catch (error) {
    console.log(error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}