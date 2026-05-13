"use client";


import { ChangeEvent, Dispatch, SetStateAction, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

interface UploadPhotoProps {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  preview?: string;
  label?: string;
  uploading?: boolean;
  initials?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function UploadPhoto({
  file,
  setFile,
  preview,
  label = "Upload photo",
  uploading = false,
  initials = "?",
}: UploadPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Blob URL shows instantly when user picks a file.
  // Falls back to saved URL (cache-busted by parent after upload).
  const imagePreview = file ? URL.createObjectURL(file) : (preview || "");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED.includes(selected.type)) {
      alert("Please select a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (selected.size > MAX_SIZE) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setFile(selected);

    // Reset so the same file can be re-selected after an error
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      )}

      <div className="flex items-center gap-5">
        {/* Avatar preview */}
        <div className="relative flex-shrink-0">
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-blue-100 flex items-center justify-center">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Profile photo preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-2xl font-semibold text-blue-700 select-none">
                {initials}
              </span>
            )}
          </div>

          {/* Camera button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-700 disabled:opacity-60 transition-colors"
            title="Change profile photo"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {/* Text hint */}
        <div className="text-xs text-slate-400 leading-5">
          {uploading ? (
            <span className="flex items-center gap-1.5 text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading…
            </span>
          ) : (
            <>
              <p>Click the camera to change your photo.</p>
              <p>JPEG, PNG, WebP · Max 5MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}