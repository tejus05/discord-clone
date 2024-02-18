import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";

interface Props{
  params: {
    memberId: string
  }
}

export async function PATCH(request: NextRequest, {params: {memberId}}:Props) {
  try {
    
    const profile = await currentProfile();

    const { searchParams } = new URL(request.url);

    const { role } = await request.json();

    const serverId = searchParams.get("serverId");

    if(!profile) return new NextResponse("Unauthorised",{status:401})
    
    if(!serverId) return new NextResponse("Server ID Missing",{status:400})

    if(!memberId) return new NextResponse("Member ID Missing",{status:400})

    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              profileId: {
                not: profile.id
              }
            },
            data: {
              role
            }
          }
        }
      },
      include: {
        members: {
          include: {
            profile: true
          },
          orderBy: {
            role: "asc"
          }
        }
      }
    })
    
    return NextResponse.json(server);

  } catch (error) {
    console.log("[MEMBERS_PATCH]",error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params:{ memberId } }:Props) {
  try {

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorised", { status: 401 })

    const { searchParams } = new URL(request.url);

    const serverId = searchParams.get("serverId");

    if (!memberId) return new NextResponse("Member ID Missing", { status: 400 })

    if (!serverId) return new NextResponse("Server ID Missing", { status: 400 })

    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: profile.id
            }
          }
        }
      },
      include: {
        members: {
          include: {
            profile: true
          },
          orderBy: {
            role: "asc"
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