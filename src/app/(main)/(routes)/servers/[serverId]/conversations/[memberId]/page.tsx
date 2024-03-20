import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessages from "@/components/chat/ChatMessages";
import prisma from "@/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/currentProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface MemberIdPageProps{
  params: {
    serverId: string,
    memberId: string
  }
}

const MemberIdPage = async ({params:{memberId, serverId}}:MemberIdPageProps) => {

  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const currentMember = await prisma.member.findFirst({
    where: {
      serverId,
      profileId: profile.id
    },
    include: {
      profile: true
    }
  })

  if (!currentMember) return redirect("/");

  const conversation = await getOrCreateConversation(currentMember.id, memberId);

  if (!conversation) return redirect(`/servers.${serverId}`);

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
      />
      <ChatMessages
        apiUrl="/api/direct-messages"
        chatId={conversation.id}
        member={currentMember}
        name={otherMember.profile.name}
        paramKey="conversationId"
        paramValue={conversation.id}
        socketQuery={{
          conversationId: conversation.id
        }}
        socketUrl="/api/socket/direct-messages"
        type="conversation"
      />
      <ChatInput
        apiUrl="/api/socket/direct-messages"
        name={otherMember.profile.name}
        query={{
          conversationId: conversation.id
        }}
        type="conversation"
      />
    </div>
  )
}

export default MemberIdPage