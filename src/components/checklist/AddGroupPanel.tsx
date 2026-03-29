"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { COLORS, groupStyles } from "@/lib/utils";
import { addChecklistGroupAction } from "@/app/dashboard/oppgaver/actions";
import type { Group } from "@/types";

interface Props {
  setGroups: Dispatch<SetStateAction<Group[]>>;
}

export function AddGroupPanel({ setGroups }: Props) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("blue");

  async function handleAdd() {
    if (!title.trim()) return;
    const res = await addChecklistGroupAction(title, color);
    if (res.ok && res.group) {
      setGroups((prev) => [...prev, { ...res.group, items: [] }]);
      setTitle("");
      setColor("blue");
      setShow(false);
    }
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="rounded-xl border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors h-full min-h-[200px]"
      >
        <span className="text-3xl">+</span>
        <span className="text-sm font-medium">Ny kategori</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 p-4 space-y-3 h-full min-h-[200px]">
      <h3 className="font-semibold text-gray-700 text-sm">Ny kategori</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
          if (e.key === "Escape") setShow(false);
        }}
        aria-label="Kategorinavn"
        placeholder="Navn på kategori..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex gap-1 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-gray-800 scale-110" : "border-transparent"} ${groupStyles[c].header.split(" ")[0]}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Legg til
        </button>
        <button
          onClick={() => setShow(false)}
          className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
