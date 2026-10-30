"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

type Folder = "gallery" | "staff" | "products" | "reviews" | "site";

const MAX_EDGE = 1800;

/** Phone photos are 5–10 MB; resizing in the browser keeps the gallery fast and uploads quick. */
async function shrinkImage(file: File): Promise<Blob> {
  if (file.type === "image/gif" || !("createImageBitmap" in window)) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.86));
}

export function ImageUpload({
  folder,
  value,
  onUploaded,
  label = "Image",
}: {
  folder: Folder;
  value?: string | null;
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const body = await shrinkImage(file);
      const name = file.name.replace(/\.[^.]+$/, "") + (body.type === "image/jpeg" ? ".jpg" : "");
      const blob = await upload(`${folder}/${name}`, body, {
        access: "public",
        handleUploadUrl: "/api/media/upload",
        contentType: body.type || file.type,
      });
      onUploaded(blob.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[#c98d82]">{label}</div>
      <div className="flex items-center gap-4">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-sm border border-[#efdcd8] bg-[#faf6f5]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl text-[#8d8e8f]">+</span>
          )}
        </div>
        <label
          className={`rounded-sm border border-[#efdcd8] bg-white px-3.5 py-2 text-[12px] tracking-[0.06em] text-[#232122] ${
            uploading ? "opacity-60" : "cursor-pointer hover:border-[#232122]"
          }`}
        >
          {uploading ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>
      {error && <div className="mt-2 text-[11px] text-[#d41d7f]">{error}</div>}
    </div>
  );
}
