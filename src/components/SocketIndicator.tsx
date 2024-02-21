"use client";

import { useSocket } from "./providers/SocketProvider";
import { Badge } from "./ui/badge";

const SocketIndicator = () => {

  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <Badge variant="outline" className="bg-yellow-600 text-white border-none">
        Fallback: Polling every 1s
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-emerald-600 text-white border-none">
      Live : Real Time Updates
    </Badge>
  );
}

export default SocketIndicator