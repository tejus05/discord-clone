"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { } from "./ui/tooltip";

interface ActionTooltipProps{
  label: string,
  children: React.ReactNode,
  side?: "top" | "right" | "bottom" | "left",
  align: "start" | "center" | "end"
}

const ActionTooltip = ({align, children, label, side}:ActionTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p className="font-semibold text-sm capitalize">
            {
              label.toLocaleLowerCase()
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ActionTooltip