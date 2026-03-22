"use client";
// src/components/AvvikCount.tsx
import { useState, useEffect } from "react";

export function AvvikCount({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    async function fetchCount() {
      const res = await fetch("/api/avvik/count");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    }

    const interval = setInterval(fetchCount, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
      {count}
    </span>
  );
}
