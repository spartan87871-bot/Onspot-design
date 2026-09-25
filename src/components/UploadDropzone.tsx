"use client";

import { useCallback, useRef, useState } from "react";

interface UploadDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  label?: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadDropzone({
  images,
  onChange,
  max = 3,
  label = "Upload reference photos",
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;
      setError(null);
      const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      const room = max - images.length;
      if (files.length === 0) return;
      if (room <= 0) {
        setError(`You can add up to ${max} reference photos`);
        return;
      }
      const toAdd = files.slice(0, room);
      try {
        const dataUrls = await Promise.all(toAdd.map(fileToDataUrl));
        onChange([...images, ...dataUrls]);
      } catch {
        setError("Couldn't read one of those files — try a different image");
      }
    },
    [images, max, onChange]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver ? "border-indigo bg-paper" : "border-line bg-paper/60 hover:bg-paper"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-soft mt-1">
          Tap to choose, or drag photos here · up to {max} · {images.length}/{max} added
        </p>
      </div>

      {error && <p className="text-xs text-madder mt-2">{error}</p>}

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden border hairline bg-paper"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Reference ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(images.filter((_, idx) => idx !== i));
                }}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-ink/70 text-cream text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
