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
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useState } from "react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const router = useRouter();

  const { apiUrl, query } = data;

  const isModalOpen = isOpen && type === "deleteMessage";

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query
      });
      await axios.delete(url);

      router.refresh();
      onClose();
      
    } catch (error) {
      toast.error("Could not delete the message! Please try again or refresh the page. ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this? <br />
            The message will be permanently deleted. 
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

export default DeleteMessageModal;
