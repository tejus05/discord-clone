"use client";

import { useChatPusher } from "@/hooks/useChatPusher";
import { useChatQuery } from "@/hooks/useChatQuery";
import { useChatScroll } from "@/hooks/useChatScroll";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Member, Message, Profile } from "@prisma/client";
import { format } from 'date-fns';
import { Loader2, ServerCrash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import ChatItem from "./ChatItem";
import ChatWelcome from "./ChatWelcome";

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

  
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useChatPusher({queryKey, addKey, updateKey})
  
  useChatScroll({
    bottomRef,
    chatRef,
    count: data?.pages?.[0]?.items?.length ?? 0,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage
  });
  
  
  const router = useRouter();
  const params = useParams();
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`server:${params?.serverId}:member:modify`)
    );

    pusherClient.subscribe(
      toPusherKey(`server:${params?.serverId}:member:kick`)
    );

    const onMemberModify = () => {
      setShouldRefresh(true);
      router.refresh();
      window.location.reload();
    };

    const onMemberKick = () => {
      setShouldRefresh(true);
      router.refresh();
      window.location.reload();
    };

    pusherClient.bind("member-kick", onMemberKick);
    pusherClient.bind("member-modify", onMemberModify);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`server:${params?.serverId}:member:modify`)
      );

      pusherClient.unsubscribe(
        toPusherKey(`server:${params?.serverId}:member:kick`)
      );

      pusherClient.unbind("member-kick", onMemberKick);
      pusherClient.unbind("member-modify", onMemberModify);
    }
  }, [router, params, shouldRefresh, setShouldRefresh]);

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
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {
        hasNextPage && (
          <div className="flex justify-center">
            {
              isFetchingNextPage ? (
                <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
              ) : (
                  <button
                  onClick={()=>fetchNextPage()}
                    className="text-zinc-50 hover:text-zinc-600 dark:text-zinc-400 text-sm my-4 dark:hover:text-zinc-300 transition"
                  >
                    Load previous messages
                  </button>
              )
            }
          </div>
        )
      }
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: MessageWithMemberWithProfile) => (
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
            ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatMessages