import { currentProfile } from "@/lib/currentProfile";
import prisma from '@/db'
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; 
import { MemberRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { name, imageUrl } = await request.json(); 
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorised",{status: 401})
    }

    const server = await prisma.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [
            {
              name: "general",
              profileId: profile.id
            }
          ]
        },
        members: {
          create: [
            {
              role: MemberRole.ADMIN,
              profileId: profile.id
            }
          ]
        }
      }
    })

    return NextResponse.json(server);

  } catch (error) {
    console.log("[SERVERS POST]", error)
    return new NextResponse("Internal Error!", { status: 500 });
  }
}