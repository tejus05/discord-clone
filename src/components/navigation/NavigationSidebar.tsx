import prisma from "@/db";
import { currentProfile } from "@/lib/currentProfile";
import { redirect } from "next/navigation";
import { Separator } from "../ui/separator";
import NavigationAction from "./NavigationAction";
import { ScrollArea } from "../ui/scroll-area";
import NavigationItem from "./NavigationItem";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@clerk/nextjs";

const NavigationSidebar = async () => {
  
  const profile = await currentProfile();

  if (!profile) {
    redirect("/");
  }

  const servers = await prisma.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] py-3 bg-[#E3E5E8]">
      <NavigationAction />
      
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto"/>

      <ScrollArea className="flex-1 w-full">
        {
          servers.map(server => (
            <div key={server.id} className="mb-4">
              <NavigationItem id={server.id} name={server.name} imageUrl={server.imageUrl} />
            </div>
          ))
        }
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
          elements: {
            avatarBox: "h-[48px] w-[48px]"
          }}}
        />
      </div>
    </div>
  )
}

export default NavigationSidebar