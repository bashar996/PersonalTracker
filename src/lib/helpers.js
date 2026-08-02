// Palette used for new projects and calendar/board color coding.
export const PAL = ['#7c9885', '#b98a5e', '#7b8bb0', '#b06a72', '#9a8bb0', '#6f9ba3', '#a38b6f'];

// Legacy string priorities (pre-v2) map onto the 1-5 numeric scale (1 = highest).
const LEGACY_PRIORITY_MAP = { high: 1, med: 2, low: 3 };

export function migratePriority(p) {
  if (typeof p === 'string') return LEGACY_PRIORITY_MAP[p] || 2;
  const n = Number(p);
  return n > 0 ? n : 2;
}

// Only priorities 1-3 get a colored dot; 4-5 are unmarked.
export function priorityColor(pr) {
  pr = Number(pr) || 0;
  if (pr === 1) return '#c0564a';
  if (pr === 2) return '#c99a3f';
  return '#8a9a8f';
}

export const LIGHT_THEME = {
  page: '#f6f4ef', sidebar: '#f0ede6', sidebarBorder: '#e6e2d8', border: '#ece8df',
  text: '#26241f', text2: '#54514a', muted: '#8a8578', faint: '#a09a8c', secondary: '#6a675e',
  inputBorder: '#e2ddd2', card: '#fff', modal: '#faf9f6', hover: '#f4f1ea', btnBg: '#e3dfd4',
  chipBg: '#efece6', chipText: '#9a9488', dashedBorder: '#d6d1c4',
};
export const DARK_THEME = {
  page: '#201e1a', sidebar: '#1a1815', sidebarBorder: '#2c2a25', border: '#38352e',
  text: '#eeece5', text2: '#c7c2b4', muted: '#a9a396', faint: '#7d7969', secondary: '#b7b1a2',
  inputBorder: '#3a372f', card: '#2a2824', modal: '#262420', hover: '#332f28', btnBg: '#3a372f',
  chipBg: '#38352e', chipText: '#b7b1a2', dashedBorder: '#4a4740',
};

// CSS custom properties (--ptt-*) for the given theme, to spread onto a root inline style.
export function themeVars(dark) {
  const T = dark ? DARK_THEME : LIGHT_THEME;
  const vars = {};
  Object.keys(T).forEach((k) => { vars['--ptt-' + k] = T[k]; });
  return vars;
}

// Color for the small dot next to a task's due label when "color-coded urgency" is on.
export function urgencyDotColor(dueKind, accent) {
  if (dueKind === 'overdue') return '#b0473b';
  if (dueKind === 'today') return accent;
  if (dueKind === 'soon') return '#c99a3f';
  return null;
}

export function fmtTimer(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return pad(m) + ':' + pad(s);
}

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
  if (filters.priority !== 'all') filtered = filtered.filter((t) => String(t.priority) === filters.priority);
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
