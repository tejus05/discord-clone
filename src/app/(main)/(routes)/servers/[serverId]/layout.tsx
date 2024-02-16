import { currentProfile } from "@/lib/currentProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { ReactNode } from "react";
import prisma from "@/db";
import { redirect } from "next/navigation";
import ServerSidebar from "@/components/server/ServerSidebar";

interface ServerIdLayoutProps{
  children: ReactNode,
  params: {
    serverId: string
  }
}

const ServerIdLayout = async  ({children, params:{serverId}}:ServerIdLayoutProps) => {

  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  })

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col inset-y-0 fixed">
        <ServerSidebar serverId={server.id} />
      </div>
      <main className="h-full md:pl-60">
        {children}
      </main>
    </div>
  )
}

export default ServerIdLayout