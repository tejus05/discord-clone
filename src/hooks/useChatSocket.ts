import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface ChatSocketProps{
  addKey: string,
  updateKey: string,
  queryKey: string
}

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile
  }
}

export const useChatSocket = ({addKey, queryKey, updateKey}:ChatSocketProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {

    // update existing message

    pusherClient.subscribe(toPusherKey(updateKey));

    const updateMessageHandler = (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {

        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            })
          }
        })
        return {
          ...oldData,
          pages: newData
        }
      })
    }

    pusherClient.bind("update-message",updateMessageHandler);

    // add new message

    pusherClient.subscribe(toPusherKey(addKey));

    const createMessageHandler = (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{
              items: [message],
            }]
          }
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [
            message,
            ...newData[0].items,
          ]
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    }

    pusherClient.bind("create-message", createMessageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(updateKey));
      pusherClient.unsubscribe(toPusherKey(addKey));
      
      pusherClient.unbind("update-message",updateMessageHandler);
      pusherClient.unbind("create-message",createMessageHandler);
    }

  }, [queryClient, addKey, queryKey, updateKey]);
}