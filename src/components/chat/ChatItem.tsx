"use client";

import { cn } from "@/lib/utils";
import { Member, MemberRole, Profile } from "@prisma/client";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ActionTooltip from "../ActionTooltip";
import UserAvatar from "../UserAvatar";
import { z } from "zod";
import qs from 'query-string'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModalStore";

const formSchema = z.object({
  content: z.string().min(1)
})

type TFormSchema = z.infer<typeof formSchema>;

interface ChatItemProps{
  id: string,
  content: string,
  member: Member & {
    profile: Profile
  },
  timestamp: string,
  fileUrl: string | null,
  deleted: boolean,
  currentMember: Member,
  isUpdated: boolean,
  socketUrl: string,
  socketQuery: Record <string, string>
}

const roleIconMap = {
  "GUEST": null,
  "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500"/>,
  "ADMIN": <ShieldAlert className="h-4 w-4 ml-2 text-rose-500"/>,
}

const ChatItem = ({ content, currentMember, deleted, fileUrl, id, isUpdated, member, socketQuery, socketUrl, timestamp }: ChatItemProps) => {

  const [isEditing, setIsEditing] = useState(false);

  const { onOpen } = useModal();

  const fileType = fileUrl?.split(".").pop();

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (
    isAdmin || isModerator || isOwner
  )
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPdf = fileType === "pdf" && fileUrl;
  const isImage = !isPdf && fileUrl;

  const form = useForm<TFormSchema>({
    defaultValues: {
      content,
    },
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    form.reset({
      content
    })
  },[content]);

  const { formState: { isSubmitting } } = form;

  const router = useRouter();
  const params = useParams();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await axios.patch(url, values);

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event:any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    }

    window.addEventListener("keydown",handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, []);

  const onMemberClick = () => {
    if (member.id === currentMember.id) return;

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  }

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-center w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition" onClick={onMemberClick}>
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm hover:underline cursor-pointer" onClick={onMemberClick}>
                {member.profile.name}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}

          {isPdf && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-200" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PDF File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}

          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button size="sm" variant="primary" disabled={isSubmitting}>
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press "Esc" to cancel and "Enter" to save.
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && !isEditing && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => {
                  setIsEditing(true);
                }}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          {isEditing && (
            <ActionTooltip label="Cancel Editing">
              <X
                onClick={() => {
                  setIsEditing(false);
                }}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          {canDeleteMessage && (
            <ActionTooltip label="Delete">
              <Trash
                onClick={() => {
                  onOpen("deleteMessage", {
                    apiUrl: `${socketUrl}/${id}`,
                    query: socketQuery
                  })
                }}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatItem