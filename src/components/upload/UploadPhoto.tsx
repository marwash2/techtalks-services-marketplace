"use client";

import Image from "next/image";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface UploadPhotoProps {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  preview?: string;
  label?: string;
}

export default function UploadPhoto({
  file,
  setFile,
  preview,
  label = "Upload Image",
}: UploadPhotoProps) {
  const imagePreview = file ? URL.createObjectURL(file) : preview;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28 overflow-hidden rounded-xl border bg-gray-100">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No Image
            </div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleChange} />
      </div>
    </div>
  );
}
