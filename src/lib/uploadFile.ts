import { supabase } from "./supabase";
export async function uploadFile(file: File, bucket: string) {
  if (!file) {
    throw new Error("No file");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid image");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Max size is 5MB");
  }
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.log(error);
    return;
  }
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}
