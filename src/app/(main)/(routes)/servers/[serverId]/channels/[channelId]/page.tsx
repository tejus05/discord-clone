import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import prisma from "@/db";
import { currentProfile } from "@/lib/currentProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";


interface ChannelIdPageProps{
  params: {
    channelId: string,
    serverId: string,
  }
}

const ChannelIdPage = async ({params:{channelId, serverId}}:ChannelIdPageProps) => {

  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const channel = await prisma.channel.findUnique({
    where: {
      id: channelId
    }
  })

  const member = await prisma.member.findFirst({
    where: {
      profileId: profile.id,
      serverId
    }
  })

  if (!channel || !member) return redirect("/");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      <div className="flex-1">
        Future Messages
      </div>
      <ChatInput
        name={channel.name}
        type="channel"
        apiUrl="/api/socket/messages"
        query={{
          channelId: channel.id,
          serverId: channel.serverId
        }}
      />
    </div>
  )
}

export default ChannelIdPage