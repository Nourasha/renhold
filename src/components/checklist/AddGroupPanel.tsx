// src/components/checklist/AddGroupPanel.tsx
import { COLORS, groupStyles } from "./checklistTypes";

interface Props {
  show: boolean;
  title: string;
  color: string;
  onToggle: () => void;
  onTitleChange: (title: string) => void;
  onColorChange: (color: string) => void;
  onAdd: () => void;
}

export function AddGroupPanel({
  show, title, color,
  onToggle, onTitleChange, onColorChange, onAdd,
}: Props) {
  if (!show) {
    return (
      <button
        onClick={onToggle}
        className="rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
      >
        <span className="text-3xl">+</span>
        <span className="text-sm font-medium">Ny kategori</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 p-4 space-y-3">
      <h3 className="font-semibold text-gray-700 text-sm">Ny kategori</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAdd();
          if (e.key === "Escape") onToggle();
        }}
        placeholder="Navn på kategori..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex gap-1 flex-wrap">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-gray-800 scale-110" : "border-transparent"} ${groupStyles[c].header.split(" ")[0]}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAdd}
          disabled={!title.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Legg til
        </button>
        <button
          onClick={onToggle}
          className="px-3 py-1.5 text-gray-600 text-sm rounded-lg hover:bg-gray-100"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
