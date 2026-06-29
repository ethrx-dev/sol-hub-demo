"use client";

import { useState, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { api } from "@/src/lib/api-client";
import { Upload, X, Loader2 } from "lucide-react";

interface VideoUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

export function VideoUpload({ currentUrl, onUploaded }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/me/video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setPreview(data.url);
      onUploaded(data.url);
      toast.success("Video uploaded");
    } catch {
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/me/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Avatar uploaded");
      window.location.reload();
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-2">Profile Picture</p>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Avatar
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Intro Video</p>
        {preview ? (
          <div className="relative mb-3 overflow-hidden rounded-lg bg-muted">
            <video
              src={preview}
              controls
              className="max-h-64 w-full"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onUploaded("");
              }}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 shadow"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mb-3 flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8">
            <p className="text-sm text-muted-foreground">
              No video uploaded yet
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "video/*";
            fileInput.onchange = (e) =>
              handleFile(e as unknown as React.ChangeEvent<HTMLInputElement>);
            fileInput.click();
          }}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {preview ? "Replace Video" : "Upload Video"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          MP4, WebM, or MOV. Max 100MB.
        </p>
      </div>
    </div>
  );
}
