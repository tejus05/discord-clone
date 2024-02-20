import { currentProfile } from "@/lib/currentProfile"
import { redirectToSignIn } from "@clerk/nextjs";
import prisma from "@/db";
import { redirect } from "next/navigation";

interface ServerIdPageProps{
  params: {
    serverId: string
  }
}

const ServerIdPage = async ({params: {serverId}}:ServerIdPageProps) => {

  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "general"
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== "general") {
    return null;
  }

  return redirect(`${serverId}/channels/${initialChannel?.id}`);
}

export default ServerIdPage