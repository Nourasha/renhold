// src/components/checklist/completedHelpers.ts
import { Completion, DailyNote, getWeekKey } from "./completed/types";

export function groupByDate(filtered: Completion[]) {
  return filtered.reduce<Record<string, Record<string, Record<string, Completion[]>>>>((acc, c) => {
    if (!acc[c.date]) acc[c.date] = {};
    if (!acc[c.date][c.item.group.title]) acc[c.date][c.item.group.title] = {};
    if (!acc[c.date][c.item.group.title][c.item.label]) acc[c.date][c.item.group.title][c.item.label] = [];
    acc[c.date][c.item.group.title][c.item.label].push(c);
    return acc;
  }, {});
}

export function groupNotesByDate(notes: DailyNote[]) {
  return notes.reduce<Record<string, DailyNote[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});
}

export function getVisibleDates(
  byDate: Record<string, unknown>,
  notesByDate: Record<string, unknown>,
  filterDate: string,
  currentWeekKey: string,
) {
  return Array.from(new Set([
    ...Object.keys(byDate),
    ...Object.keys(notesByDate).filter((d) =>
      filterDate ? d === filterDate : getWeekKey(d) === currentWeekKey
    ),
  ])).sort().reverse();
}

export function filterCompletions(
  items: Completion[],
  filterDate: string,
  filterUser: string,
  currentWeekKey: string,
  filterWeek: string,
) {
  return items.filter((c) => {
    if (filterDate && c.date !== filterDate) return false;
    if (filterUser && c.user.id !== filterUser) return false;
    if (!filterDate && getWeekKey(c.date) !== currentWeekKey) return false;
    if (filterWeek && getWeekKey(c.date) !== filterWeek) return false;
    return true;
  });
}
