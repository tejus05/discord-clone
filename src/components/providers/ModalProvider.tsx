"use client";

import { useEffect, useState } from "react";
import CreateServerModal from "../modals/CreateServerModal";
import EditServerModal from "../modals/EditServerModal";
import InviteModal from "../modals/InviteModal";
import MembersModal from "../modals/MembersModal";
import CreateChannelModal from "../modals/CreateChannelModal";

const ModalProvider = () => {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal/>
      <InviteModal/>
      <EditServerModal/>
      <MembersModal />
      <CreateChannelModal/>
    </>
  )
}

export default ModalProvider