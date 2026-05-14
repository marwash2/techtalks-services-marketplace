import { supabase } from "./supabase";

export type UploadedFile = {
  path: string;
  url: string;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadFileWithPath(
  file: File,
  bucket: string,
): Promise<UploadedFile> {
  if (!file) {
    throw new Error("No file");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid image");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Max size is 5MB");
  }

  const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(error.message);
  }

  if (!data?.path) {
    throw new Error("Upload failed: no file path returned");
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Failed to generate public URL");
  }

  return {
    path: data.path,
    url: publicUrlData.publicUrl,
  };
}

export async function uploadFile(file: File, bucket: string) {
  const uploaded = await uploadFileWithPath(file, bucket);
  return uploaded.url;
}
