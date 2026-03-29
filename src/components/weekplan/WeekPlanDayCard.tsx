// src/components/weekplan/WeekPlanDayCard.tsx

interface WeekPlan {
  id: string;
  title: string;
  description?: string | null;
  dayOfWeek: string;
  startTime?: string | null;
  endTime?: string | null;
}

interface WeekPlanForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

interface Props {
  dayKey: string;
  dayLabel: string;
  dayPlans: WeekPlan[];
  isAdding: boolean;
  form: WeekPlanForm;
  loading: boolean;
  onToggleForm: () => void;
  onFormChange: (form: WeekPlanForm) => void;
  onAdd: (dayOfWeek: string) => void;
  onDelete: (id: string) => void;
}

export function WeekPlanDayCard({
  dayKey, dayLabel, dayPlans, isAdding, form, loading,
  onToggleForm, onFormChange, onAdd, onDelete,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{dayLabel}</h3>
        <button
          onClick={onToggleForm}
          className="text-blue-600 hover:text-blue-800 text-xl font-bold leading-none"
          title="Legg til"
        >
          {isAdding ? "×" : "+"}
        </button>
      </div>

      {isAdding && (
        <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            aria-label="Tittel"
            placeholder="Tittel"
            value={form.title}
            onChange={(e) => onFormChange({ ...form, title: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="time"
              aria-label="Starttid"
              value={form.startTime}
              onChange={(e) => onFormChange({ ...form, startTime: e.target.value })}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
            />
            <input
              type="time"
              aria-label="Sluttid"
              value={form.endTime}
              onChange={(e) => onFormChange({ ...form, endTime: e.target.value })}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => onAdd(dayKey)}
            disabled={loading || !form.title}
            className="w-full py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Lagre
          </button>
        </div>
      )}

      {dayPlans.length === 0 && !isAdding ? (
        <p className="text-xs text-gray-400 italic">Ingen aktiviteter</p>
      ) : (
        <ul className="space-y-2">
          {dayPlans.map((plan) => (
            <li key={plan.id} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-blue-50">
              <div>
                <p className="text-sm font-medium text-gray-800">{plan.title}</p>
                {(plan.startTime || plan.endTime) && (
                  <p className="text-xs text-gray-500">
                    {plan.startTime} {plan.endTime ? `– ${plan.endTime}` : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDelete(plan.id)}
                className="text-gray-300 hover:text-red-500 text-lg leading-none flex-shrink-0"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
