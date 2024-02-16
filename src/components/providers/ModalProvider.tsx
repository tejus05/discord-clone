"use client";

import { useEffect, useState } from "react";
import CreateServerModal from "../modals/CreateServerModal";

const ModalProvider = () => {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  },[]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal/>
    </>
  )
}

export default ModalProvider