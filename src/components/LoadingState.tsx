"use client";

import { useEffect, useState } from "react";

interface LoadingStateProps {
  messages: string[];
  compact?: boolean;
}

export default function LoadingState({ messages, compact = false }: LoadingStateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        compact ? "py-8" : "py-16"
      }`}
    >
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-terracotta animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 rounded-full bg-indigo animate-bounce" />
      </div>
      <p className="font-display text-base sm:text-lg text-ink">{messages[index]}</p>
      <p className="text-xs text-ink-soft">This usually takes 10–30 seconds</p>
    </div>
  );
}
