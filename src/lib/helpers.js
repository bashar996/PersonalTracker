// Palette used for new projects and calendar/board color coding.
export const PAL = ['#7c9885', '#b98a5e', '#7b8bb0', '#b06a72', '#9a8bb0', '#6f9ba3', '#a38b6f'];

export const PRIO = {
  high: { bg: '#f4ded9', fg: '#b0473b', label: 'High' },
  med: { bg: '#f4ead4', fg: '#a2751c', label: 'Med' },
  low: { bg: '#e6ede8', fg: '#5c7a68', label: 'Low' },
};

const MEDIA_COLORS = {
  link: { bg: '#e7ecf4', fg: '#5a6a8b', icon: 'URL' },
  image: { bg: '#e9efe9', fg: '#5c7a68', icon: 'IMG' },
  doc: { bg: '#f4ead4', fg: '#a2751c', icon: 'DOC' },
  voice: { bg: '#f1e7ef', fg: '#8c5a80', icon: 'REC' },
  note: { bg: '#efece6', fg: '#8a8578', icon: 'TXT' },
};

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAY_SHORT_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function uid() {
  return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function hx(h) {
  h = h.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgba(h, a) {
  const [r, g, b] = hx(h);
  return `rgba(${r},${g},${b},${a})`;
}

export function darken(h, f) {
  const c = hx(h).map((v) => Math.round(v * (1 - f)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function mediaColor(type) {
  return MEDIA_COLORS[type] || MEDIA_COLORS.note;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// Format a Date as the value a <input type="datetime-local"> expects.
export function dtStr(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export function ymd(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// Used only for generating seed data relative to "now".
export function offset(days, h, m) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m || 0, 0, 0);
  return dtStr(d);
}

export function parse(s) {
  return s ? new Date(s) : null;
}

export function fmtTime(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + (m ? ':' + pad(m) : '') + ' ' + ap;
}

export function fmtDate(d) {
  return MONTH_SHORT[d.getMonth()] + ' ' + d.getDate();
}

export function filterTasks(tasks, filters, hideCompleted) {
  let filtered = tasks;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((t) =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q) ||
      (t.tags || []).join(' ').toLowerCase().includes(q));
  }
  if (filters.status !== 'all') filtered = filtered.filter((t) => t.status === filters.status);
  if (filters.priority !== 'all') filtered = filtered.filter((t) => t.priority === filters.priority);
  if (filters.projectId !== 'all') filtered = filtered.filter((t) => t.projectId === filters.projectId);
  if (hideCompleted) filtered = filtered.filter((t) => t.status !== 'done');
  return filtered;
}

export function sortByDue(a, b) {
  const av = a.due || '~';
  const bv = b.due || '~';
  return av < bv ? -1 : av > bv ? 1 : 0;
}

export function projectById(projects, id) {
  return (projects || []).find((p) => p.id === id) || null;
}

// Classify a task's due date relative to "now" into overdue / today / soon / far.
export function dueInfo(t, now) {
  now = now || new Date();
  if (!t.due) return null;
  const d = parse(t.due);
  const today = ymd(now);
  const dk = t.due.slice(0, 10);
  const done = t.status === 'done';
  const tmr = new Date(now);
  tmr.setDate(now.getDate() + 1);
  if (!done && d < now && dk !== today) return { label: 'Overdue · ' + fmtDate(d), kind: 'overdue' };
  if (dk === today) return { label: (done ? '' : 'Today · ') + (done ? fmtDate(d) : fmtTime(d)), kind: done ? 'far' : 'today' };
  if (dk === ymd(tmr)) return { label: 'Tomorrow · ' + fmtTime(d), kind: 'soon' };
  const diff = (d - now) / 86400000;
  if (diff > 0 && diff < 7) return { label: WEEKDAY_NAMES[d.getDay()].slice(0, 3) + ' · ' + fmtTime(d), kind: 'soon' };
  return { label: fmtDate(d), kind: 'far' };
}
