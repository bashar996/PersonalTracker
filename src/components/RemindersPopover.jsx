import React from 'react';

export default function RemindersPopover({ reminders, onOpenTask }) {
  return (
    <div className="popover">
      <div className="popover-title">Reminders</div>
      {reminders.length > 0 ? (
        <div>
          {reminders.map((r) => (
            <button key={r.id} type="button" className="reminder-row" onClick={() => onOpenTask(r.id)}>
              <span className="project-dot" style={{ background: r.color }} />
              <span className="reminder-title">{r.title}</span>
              <span style={{ font: "500 12px 'Instrument Sans'", color: r.overdue ? '#b0473b' : r.soon ? 'var(--accent-dark)' : '#8a8578' }}>{r.whenLabel}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="popover-empty">No reminders set.</div>
      )}
    </div>
  );
}
