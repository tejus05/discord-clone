import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";

interface Props{
  params: {
    serverId: string
  }
}

export async function PATCH(request:NextRequest, {params:{serverId}}:Props) {
  try {
    const { name, imageUrl } = await request.json();
  
    const profile = await currentProfile();
  
    if (!profile) {
      return new NextResponse("Unauthorised", { status: 401 })
    }

    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id
      },
      data: {
        name,
        imageUrl
      }
    })

    return NextResponse.json(server);

  } catch (error) {
    console.log("[SERVERS PATCH]", error)
    return new NextResponse("Internal Error!", { status: 500 });
  }
}