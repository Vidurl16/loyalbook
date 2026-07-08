"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Folder = "gallery" | "staff" | "products" | "reviews" | "transformations";

/**
 * Admin image uploader. Requests a signed URL from the server, PUTs the file
 * straight to Supabase Storage, then hands the public URL back to the caller to
 * persist on the row. Keeps large uploads off the Next.js server.
 */
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
  const createUploadUrl = trpc.media.createUploadUrl.useMutation();

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const { signedUrl, publicUrl } = await createUploadUrl.mutateAsync({
        folder,
        contentType: file.type,
      });
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed. Please try again.");
      onUploaded(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold-400)", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 72, height: 72, flexShrink: 0,
          border: "1px solid var(--onyx-700)", borderRadius: 2,
          background: "var(--onyx-800)", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 20, color: "var(--onyx-500)" }}>+</span>
          )}
        </div>
        <label style={{
          cursor: uploading ? "default" : "pointer",
          fontSize: 12, letterSpacing: "0.06em", color: "var(--cream-200)",
          border: "1px solid var(--onyx-700)", borderRadius: 2, padding: "8px 14px",
          background: "var(--onyx-800)", opacity: uploading ? 0.6 : 1,
        }}>
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 11, color: "#e57373" }}>{error}</div>}
    </div>
  );
}
