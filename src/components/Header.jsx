import React from 'react';
import RemindersPopover from './RemindersPopover';

export default function Header({
  title, subtitle, onToggleNav, onNewTask,
  darkMode, onToggleDark,
  remindersOpen, onToggleReminders, reminders, reminderBadge, onOpenTask, bellPulse,
}) {
  return (
    <header className="pt-header">
      <div className="pt-header-left">
        <button type="button" className="icon-btn pt-burger" onClick={onToggleNav}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ptt-text2)" strokeWidth="1.9" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 className="pt-title">{title}</h1>
          <div className="pt-sub">{subtitle}</div>
        </div>
      </div>
      <div className="pt-header-right">
        <button type="button" className="icon-btn" onClick={onToggleDark}>
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.6A9 9 0 1 1 11.4 3a7 7 0 0 0 9.6 9.6Z" /></svg>
          )}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleReminders}
          style={bellPulse ? { animation: 'ptt-breathe 2.4s ease-in-out infinite' } : undefined}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ptt-text2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          {reminderBadge > 0 && <span className="badge">{reminderBadge}</span>}
        </button>
        <button type="button" className="btn-primary pt-newbtn" onClick={onNewTask}>
          +<span className="pt-newlabel">&nbsp;New task</span>
        </button>
        {remindersOpen && <RemindersPopover reminders={reminders} onOpenTask={onOpenTask} />}
      </div>
    </header>
  );
}
