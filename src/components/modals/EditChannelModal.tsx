"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModalStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChannelType } from "@prisma/client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import toast from "react-hot-toast";

const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const { channel, server } = data;

  const isModalOpen = isOpen && type === "editChannel";

  const router = useRouter();
  const params = useParams();

  const [isChannelUpdated, setIsChannelUpdated]=useState(false);

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`server:${params?.serverId}:channel:update`)
    );

    const onChannelUpdate = () => {
      setIsChannelUpdated(true);
      router.refresh();
    };

    pusherClient.bind("channel-update", onChannelUpdate);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`server:${params?.serverId}:channel:update`)
      );

      pusherClient.unbind("channel-update", onChannelUpdate);

    }
  }, [server?.id, setIsChannelUpdated, isChannelUpdated, channel?.id, params, router]);

  const FormValidator = z.object({
    name: z
      .string()
      .min(1, {
        message: "Channel name is required",
      })
      .refine((name) => name !== "general", {
        message: "Channel name cannot be 'general' ",
      }),
    type: z.nativeEnum(ChannelType),
  });

  type TFormValidator = z.infer<typeof FormValidator>;

  const form = useForm<TFormValidator>({
    defaultValues: {
      name: "",
      type: channel?.type || "TEXT",
    },
    resolver: zodResolver(FormValidator),
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
  } = form;

  const onSubmit = async (values: TFormValidator) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.patch(url, values);
      setIsChannelUpdated(true);

      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Could not edit the channel! Please try again or refresh the page. ");
      setIsChannelUpdated(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [channel, form, isModalOpen]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter channel name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Type</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ChannelType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLocaleLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isSubmitting}>
                Edit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChannelModal;
