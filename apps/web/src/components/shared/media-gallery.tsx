"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
}

export function MediaGallery({ items }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No media yet.
      </div>
    );
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % items.length : null
    );
  const goPrev = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + items.length) % items.length : null
    );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
          >
            {item.type === "video" ? (
              <video
                src={item.url}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={item.url}
                alt={item.caption || ""}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            )}
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white">{item.caption}</p>
              </div>
            )}
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
                  <Play className="ml-0.5 h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={goPrev}
            className="absolute left-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="max-h-[90vh] max-w-[90vw]">
            {items[lightboxIndex].type === "video" ? (
              <video
                src={items[lightboxIndex].url}
                className="max-h-[90vh] max-w-[90vw]"
                controls
                autoPlay
              />
            ) : (
              <img
                src={items[lightboxIndex].url}
                alt={items[lightboxIndex].caption || ""}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white">
            {lightboxIndex + 1} / {items.length}
            {items[lightboxIndex].caption && (
              <span className="ml-2 text-muted-foreground">
                {items[lightboxIndex].caption}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
