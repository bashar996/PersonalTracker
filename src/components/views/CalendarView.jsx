import React from 'react';
import TaskRow from '../TaskRow';
import MarkdownPreview from '../MarkdownPreview';
import { ymd, sortByDue, projectById, rgba, MONTH_NAMES, WEEKDAY_NAMES, WEEKDAY_SHORT_MON_FIRST, fmtDate } from '../../lib/helpers';

function buildWeeks(projects, tasks, cal, calSel, accent) {
  const y = cal.y, m = cal.m;
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const weeksN = Math.ceil((offset + daysInMonth) / 7);
  const todayKey = ymd(new Date());

  const byDay = {};
  tasks.forEach((t) => {
    if (!t.due) return;
    const k = t.due.slice(0, 10);
    (byDay[k] = byDay[k] || []).push(t);
  });

  const start = new Date(y, m, 1 - offset);
  const weeks = [];
  for (let w = 0; w < weeksN; w++) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + w * 7 + i);
      const key = ymd(cur);
      const inMonth = cur.getMonth() === m;
      const list = byDay[key] || [];
      const sel = key === calSel;
      const isToday = key === todayKey;

      const seen = {};
      const cols = [];
      list.forEach((t) => {
        const c = (projectById(projects, t.projectId) || { color: '#999' }).color;
        if (!seen[c]) { seen[c] = true; cols.push(c); }
      });
      const dots = cols.slice(0, 4);
      const extra = cols.length > 4 ? cols.length - 4 : 0;
      const hasItems = list.length > 0;

      const cellStyle = {
        background: sel ? rgba(accent, 0.1) : (hasItems && inMonth ? 'var(--ptt-card)' : (inMonth ? 'var(--ptt-modal)' : 'transparent')),
        borderColor: sel ? accent : (hasItems && inMonth ? 'var(--ptt-inputBorder)' : (inMonth ? 'var(--ptt-sidebar)' : 'transparent')),
        opacity: inMonth ? 1 : 0.45,
        boxShadow: hasItems && inMonth && !sel ? '0 1px 2px rgba(0,0,0,.04)' : 'none',
      };
      const numStyle = {
        fontWeight: isToday || hasItems ? 700 : 500,
        background: isToday ? accent : 'transparent',
        color: isToday ? '#fff' : (inMonth ? (hasItems ? 'var(--ptt-text)' : 'var(--ptt-secondary)') : 'var(--ptt-faint)'),
      };

      days.push({ key, dayNum: cur.getDate(), dots, extra, cellStyle, numStyle });
    }
    weeks.push(days);
  }
  return weeks;
}

export default function CalendarView({
  projects, tasks, cal, calSel, accent, onPrevMonth, onNextMonth, onSelectDay, onOpenTask, onToggleStatus,
  colorUrgency, reduceClutter,
  calNotes, calNotesEditing, onCalNotesChange, onCalNotesBlur, onToggleCalNotesEdit,
}) {
  const weeks = buildWeeks(projects, tasks, cal, calSel, accent);
  const monthLabel = MONTH_NAMES[cal.m] + ' ' + cal.y;
  const calDayTasks = tasks.filter((t) => t.due && t.due.slice(0, 10) === calSel).slice().sort(sortByDue);
  const calSelDate = new Date(calSel + 'T00:00');
  const calSelLabel = WEEKDAY_NAMES[calSelDate.getDay()] + ', ' + fmtDate(calSelDate);

  return (
    <div className="view-wrap-cal">
      <div className="cal-head">
        <div className="cal-month">{monthLabel}</div>
        <div className="cal-nav">
          <button type="button" className="cal-nav-btn" onClick={onPrevMonth}>‹</button>
          <button type="button" className="cal-nav-btn" onClick={onNextMonth}>›</button>
        </div>
      </div>
      <div className="cal-weekdays">
        {WEEKDAY_SHORT_MON_FIRST.map((wd) => <div className="cal-weekday" key={wd}>{wd}</div>)}
      </div>
      <div className="cal-weeks">
        {weeks.map((days, wi) => (
          <div className="cal-week" key={wi}>
            {days.map((d) => (
              <button type="button" key={d.key} className="cal-day" style={d.cellStyle} onClick={() => onSelectDay(d.key)}>
                <div className="cal-day-num" style={d.numStyle}>{d.dayNum}</div>
                <div className="cal-dots">
                  {d.dots.map((c, i) => <span className="cal-dot" style={{ background: c }} key={i} />)}
                  {d.extra > 0 && <span className="cal-extra">+{d.extra}</span>}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
      <h2 className="section-title" style={{ margin: '0 4px 9px' }}>{calSelLabel}</h2>
      {calDayTasks.length > 0 ? (
        <div className="card-list" style={{ marginBottom: 22 }}>
          {calDayTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              project={projectById(projects, t.projectId)}
              accent={accent}
              colorUrgency={colorUrgency}
              reduceClutter={reduceClutter}
              onOpen={onOpenTask}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="empty-plain" style={{ padding: '24px 4px', textAlign: 'left', marginBottom: 0 }}>Nothing scheduled for this day.</div>
      )}

      <div className="notecard-head">
        <h2 className="notecard-title">Notes</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {calNotesEditing && <span className="notecard-hint">Markdown supported</span>}
          {!calNotesEditing && (
            <button type="button" className="notecard-edit-btn" onClick={onToggleCalNotesEdit}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>Edit
            </button>
          )}
        </div>
      </div>
      {calNotesEditing ? (
        <textarea
          className="notecard-textarea"
          value={calNotes}
          onChange={onCalNotesChange}
          onBlur={onCalNotesBlur}
          placeholder="Notes for this day… Markdown: **bold**, *italic*, # heading, - list"
        />
      ) : (
        <div className="notecard-preview" onClick={onToggleCalNotesEdit}>
          <MarkdownPreview text={calNotes} emptyLabel="" />
        </div>
      )}
    </div>
  );
}
