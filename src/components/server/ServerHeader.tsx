"use client";

import { useModal } from "@/hooks/useModalStore";
import { ServerWithMembersWithProfiles } from "@/types";
import { MemberRole } from "@prisma/client";
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface ServerHeaderProps{
  server: ServerWithMembersWithProfiles,
  role?: MemberRole
}

const ServerHeader = ({server, role}:ServerHeaderProps) => {

  const { onOpen } = useModal();

  const isAdmin = role === MemberRole.ADMIN;

  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <button className="w-full text-lg font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition capitalize">
          {server.name} <ChevronDown className="h-5 w-5 ml-auto md:mr-0 mr-10" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
        {isModerator && (
          <DropdownMenuItem
            onClick={() =>
              onOpen("invite", {
                server,
              })
            }
            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer dark:hover:bg-black/20"
          >
            Invite People <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            className="px-3 py-2 text-sm cursor-pointer dark:hover:bg-black/20"
            onClick={() => {
              onOpen("editServer", {
                server,
              });
            }}
          >
            Server Settings <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => {
              onOpen("members", {
                server,
              });
            }}
            className="px-3 py-2 text-sm cursor-pointer dark:hover:bg-black/20"
          >
            Manage Members <Users className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuItem
            className="px-3 py-2 text-sm cursor-pointer dark:hover:bg-black/20"
            onClick={() => {
              onOpen("createChannel");
            }}
          >
            Create Channel <PlusCircle className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && <DropdownMenuSeparator />}

        {isAdmin && (
          <DropdownMenuItem
            className="text-rose-500 dark:text-rose-500 px-3 py-2 text-sm cursor-pointer dark:hover:bg-black/20"
            onClick={() => {
              onOpen("deleteServer", {
                server,
              });
            }}
          >
            Delete Server <Trash className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
        {!isAdmin && (
          <DropdownMenuItem
            className="text-rose-500 dark:text-rose-500 px-3 py-2 text-sm cursor-pointer dark:hover:bg-black/20"
            onClick={() => {
              onOpen("leaveServer", {
                server,
              });
            }}
          >
            Leave Server <LogOut className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ServerHeader