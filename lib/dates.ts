export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

// Monday as week start
export function startOfWeekMonday(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay(); // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  x.setDate(x.getDate() + diff);
  return x;
}

export function clampNonNeg(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function parseMonthKey(key: string) {
  // key: YYYY-MM
  const [yy, mm] = key.split('-').map((x) => parseInt(x, 10));
  return new Date(yy, (mm || 1) - 1, 1);
}

export function weeksInMonth(d: Date) {
  const s = startOfMonth(d);
  const e = endOfMonth(d);

  // count distinct Monday-start weeks touched by this month
  const seen = new Set<string>();
  let cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  while (cur <= e) {
    const wk = startOfWeekMonday(cur);
    seen.add(toISODate(wk));
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(1, seen.size);
}

export function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
