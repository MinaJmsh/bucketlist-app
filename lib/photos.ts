import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

const BUCKET = "memory-photos";

export async function pickPhotos(limit: number) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.7,
    base64: true,
  });
  return result.canceled ? [] : result.assets;
}

export async function uploadPhoto(
  asset: ImagePicker.ImagePickerAsset,
): Promise<string> {
  const ext = (asset.uri.split(".").pop() || "jpg").split("?")[0].toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(asset.base64!), {
      contentType: asset.mimeType ?? "image/jpeg",
    });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
