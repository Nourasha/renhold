// src/components/chat/MessageInput.tsx

interface Props {
  value: string;
  sending: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function MessageInput({ value, sending, placeholder, onChange, onSend }: Props) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="px-3 py-3 md:px-4 border-t border-gray-200 flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || sending}
        className="px-4 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-40 transition-colors font-medium text-sm flex-shrink-0"
      >
        {sending ? "..." : "Send"}
      </button>
    </div>
  );
}
