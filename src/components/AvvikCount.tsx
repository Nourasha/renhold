"use client";

import { useEffect, useState } from "react";

export function AvvikCount({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/avvik/count", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        setCount(data.count);
      } catch (error) {
        console.error("Feil ved henting av avvik-count:", error);
      }
    }

    fetchCount();

    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
      {count}
    </span>
  );
}
