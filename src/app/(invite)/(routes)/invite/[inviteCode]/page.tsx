import prisma from "@/db";
import { currentProfile } from "@/lib/currentProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InviteCodePageProps{
  params: {
    inviteCode: string
  }
}

const InviteCodePage = async ({params:{inviteCode}}:InviteCodePageProps) => {

  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  if (!inviteCode) {
    return redirect("/");
  }

  const existingServer = await prisma.server.findFirst({
    where: {
      inviteCode,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  })

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const server = await prisma.server.update({
    where: {
      inviteCode
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id
          }
        ]
      }
    }
  })

  if(server) return redirect(`/servers/${server.id}`)

  return null;
}

export default InviteCodePage