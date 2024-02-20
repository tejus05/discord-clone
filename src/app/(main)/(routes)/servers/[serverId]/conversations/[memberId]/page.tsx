import ChatHeader from "@/components/chat/ChatHeader";
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
    </div>
  )
}

export default MemberIdPage