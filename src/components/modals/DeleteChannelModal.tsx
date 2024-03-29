"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModalStore";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import qs from 'query-string'
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import toast from "react-hot-toast";

const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const router = useRouter();

  const { server, channel } = data;

  const params = useParams();

  const isModalOpen = isOpen && type === "deleteChannel";

  const [isLoading, setIsLoading] = useState(false);
  const [isChannelDeleted, setIsChannelDeleted] = useState(false);
  
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`server:${params?.serverId}:channel:delete`)
    );

    const onChannelDelete = () => {
      setIsChannelDeleted(true);
      router.refresh();
    };

    pusherClient.bind("channel-delete", onChannelDelete);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`server:${params?.serverId}:channel:delete`)
      );
      pusherClient.unbind("channel-delete", onChannelDelete);
    }
  }, [server?.id, setIsChannelDeleted, isChannelDeleted, channel?.id, params, router]);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id
        }
      })
      await axios.delete(url);
      setIsChannelDeleted(true);

      router.push(`/servers/${server?.id}`);
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Could not delete the channel! Please try again or refresh the page. ");
      setIsChannelDeleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this? <br />
            <span className="font-semibold text-indigo-500">
              #{channel?.name} will be permanently deleted.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-6 py-6 bg-gray-100">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={onClick} variant="primary">
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal;
