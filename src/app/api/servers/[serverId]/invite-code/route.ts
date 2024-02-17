// `/api/servers/${server?.id}/invite-code`

import prisma from "@/db";
import { v4 as uuidv4 } from 'uuid';

import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";

interface Props{
  params: {
    serverId: string
  }
}

export async function PATCH(request:NextRequest, {params:{serverId}}:Props) {
  try {

    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorised", { status: 401 });
    
    if (!serverId) return new NextResponse("Server ID Missing", { status: 400 });

    const server = await prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id // by default, only admin can access this feature
      },
      data: {
        inviteCode: uuidv4()
      }
    })
    
    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_ID]",error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}