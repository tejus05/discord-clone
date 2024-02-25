"use client";

import { useSocket } from "@/components/providers/SocketProvider";
import { Member, Message, Profile } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, ServerCrash } from "lucide-react";
import qs from "query-string";
import { Fragment } from "react";
import ChatItem from "./ChatItem";
import ChatWelcome from "./ChatWelcome";

interface ChatMessagesProps {
  name: string,
  member: Member,
  chatId: string,
  apiUrl: string,
  socketUrl: string;
  socketQuery: Record<string, string>,
  paramKey: "channelId" | "conversationId",
  paramValue: string,
  type: "channel" | "conversation",
}

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

const ChatMessages = ({
  apiUrl,
  chatId,
  member,
  name,
  paramKey,
  paramValue,
  socketQuery,
  socketUrl,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;

  const { isConnected } = useSocket();

  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const res = await fetch(url);
    // return NextResponse.json({
    //   items: messages,
    //   nextCursor
    // })
    return res.json();
  };

   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
     useInfiniteQuery({
       queryKey: [queryKey],
       queryFn: fetchMessages,
       getNextPageParam: (lastPage) => lastPage?.nextCursor,
       initialPageParam: undefined,
       refetchInterval: isConnected ? false : 1000,
     });


  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1" />
      <ChatWelcome type={type} name={name} />
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
    </div>
  );
};

export default ChatMessages;
