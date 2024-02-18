import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";

interface Props{
  params: {
    serverId: string
  }
}

export async function PATCH(request: NextRequest, {params: {serverId}}:Props) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 });

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: {
          not: profile.id
        },
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id
          }
        }
      }
    })

    return NextResponse.json(server);
    
  } catch (error) {
    console.log("[SERVER_ID_LEAVE]",error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}