"use client";

import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ActionTooltip from "../ActionTooltip";
import { useModal } from "@/hooks/useModalStore";

interface ServerChannelProps{
  channel: Channel,
  server: Server,
  role?: MemberRole
}

const iconMap = {
  [ChannelType.TEXT] : Hash,
  [ChannelType.AUDIO] : Mic,
  [ChannelType.VIDEO] : Video
}

const ServerChannel = ({ channel, server, role }:ServerChannelProps) => {

  const router = useRouter();
  const params = useParams();

  const Icon = iconMap[channel.type]

  const { onOpen } = useModal();

  return (
    <div
      onClick={()=>{}}
      className={cn("group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
      params?.channelId === channel.id && "bg-zinc-700 dark:bg-zinc-700"
      )}
    >
      <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      <p className={cn("line-clamp-1 font-semibold text-start text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
      params?.channelId === channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
      )}>
        {channel.name}
      </p>
      {
        channel.name !== "general" && role !== MemberRole.GUEST && (
          <div className="ml-auto flex items-center gap-x-2">
            <ActionTooltip label="Edit">
              <Edit className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" onClick={() => {
                onOpen("editChannel", {
                  server,
                  channel
                })
              }}/>
            </ActionTooltip>
            <ActionTooltip label="Delete">
              <Trash className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" onClick={() => {
                onOpen("deleteChannel", {
                  channel,
                  server
                });
              }}/>
            </ActionTooltip>
          </div>
        )
      }
      {
        channel.name === "general" && (
          <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400"/>
        )
      }
    </div>
  )
}

export default ServerChannel