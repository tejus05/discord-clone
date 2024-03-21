"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface ActionTooltipProps{
  label: string,
  children: ReactNode,
  side?: "top" | "right" | "bottom" | "left",
  align?: "start" | "center" | "end"
}

const ActionTooltip = ({align, children, label, side}:ActionTooltipProps) => {
  return (
    <span>
      <TooltipProvider>
        <Tooltip delayDuration={50}>
          <TooltipTrigger asChild className="block z-10">
            {children}
          </TooltipTrigger>
          <TooltipContent side={side} align={align}>
            <p className="font-semibold text-sm capitalize hidden md:block">
              {label.toLocaleLowerCase()}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

export default ActionTooltip