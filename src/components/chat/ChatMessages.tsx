"use client";

import { useChatQuery } from "@/hooks/useChatQuery";
import { Member, Message, Profile } from "@prisma/client";
import { Loader2, ServerCrash } from "lucide-react";
import ChatWelcome from "./ChatWelcome";
import { Fragment } from "react";
import ChatItem from "./ChatItem";
import { format } from 'date-fns'
import { useChatPusher } from "@/hooks/useChatPusher";

interface ChatMessagesProps{
  name: string,
  member: Member,
  chatId: string,
  apiUrl: string,
  socketUrl: string,
  socketQuery: Record<string, string>,
  paramKey: "channelId" | "conversationId",
  paramValue: string,
  type: "channel" | "conversation"
}

const DATE_FORMAT =  "d MMM yyyy, HH:mm"

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile
  }
}

const ChatMessages = ({apiUrl, chatId, member, name, paramKey, paramValue, socketQuery, socketUrl, type}:ChatMessagesProps) => {
  
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue
  });
  
  

  useChatPusher({queryKey, addKey, updateKey})


  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4"/>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4"/>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1"/>
      <ChatWelcome
        type={type}
        name={name}
      />
      <div className="flex flex-col-reverse mt-auto">
        {
          data?.pages?.map((group,i) => (
            <Fragment key={i}>
              {
                group.items.map((message:MessageWithMemberWithProfile ) => (
                  <div key={message.id}>
                    {
                      <ChatItem
                        currentMember={member}
                        key={message.id}
                        id={message.id}
                        content={message.content}
                        fileUrl={message.fileUrl}
                        deleted={message.deleted}
                        timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                        isUpdated={message.updatedAt !== message.createdAt}
                        socketUrl={socketUrl}
                        socketQuery={socketQuery}
                        member={message.member}
                      />
                    }
                  </div>
                ))
              }
            </Fragment>
          ))
        }
      </div>
    </div>
  )
}

export default ChatMessages