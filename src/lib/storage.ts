import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service-role key. Never import this into
 * client components — the service-role key must never reach the browser.
 */
function getStorageClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase storage is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  if (!client) {
    client = createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  return client;
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export type UploadFolder = "gallery" | "staff" | "products" | "reviews" | "transformations";

/**
 * Mint a signed upload URL the admin browser can PUT a file to directly (keeps
 * large uploads off the Next server). Returns the eventual public URL to persist
 * on the row once the upload completes.
 */
export async function createSignedUpload(folder: UploadFolder, contentType: string) {
  const ext = EXT_BY_TYPE[contentType];
  if (!ext) throw new Error("Unsupported image type. Use JPEG, PNG, WebP, AVIF or GIF.");

  const supabase = getStorageClient();
  const path = `${folder}/${randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Could not create upload URL.");

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: pub.publicUrl,
  };
}
