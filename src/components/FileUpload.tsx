"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps{
  onChange(url?: string): void,
  value: string,
  endpoint: "messageFile" | "serverImage"
}

const FileUpload = ({
  endpoint,
  onChange,
  value
}:FileUploadProps) => {

  const fileType = value.split(".").pop();

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image
          fill
          src={value}
          alt="Upload"
          className="rounded-full"
        />
        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
          onClick={() => { onChange("") }}
        >
          <X className="h-4 w-4"/>
        </button>
      </div>
    )
  }

  return (
    <UploadDropzone
      endpoint="serverImage"
      onClientUploadComplete={(res) => {
        onChange(res[0].url) // potential error
      }}
      onUploadError={(error:Error) => {
        console.log(error)
      }}
    />
  )
}

export default FileUpload