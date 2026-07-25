import React from 'react';
import RemindersPopover from './RemindersPopover';
import SettingsPopover from './SettingsPopover';

export default function Header({
  title, subtitle, onToggleNav, onNewTask,
  remindersOpen, onToggleReminders, reminders, reminderBadge, onOpenTask,
  settingsOpen, onToggleSettings, accent, hideCompleted, onSetAccent, onSetHideCompleted,
}) {
  return (
    <header className="pt-header">
      <div className="pt-header-left">
        <button type="button" className="icon-btn pt-burger" onClick={onToggleNav}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#54514a" strokeWidth="1.9" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 className="pt-title">{title}</h1>
          <div className="pt-sub">{subtitle}</div>
        </div>
      </div>
      <div className="pt-header-right">
        <button type="button" className="icon-btn" onClick={onToggleSettings}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#54514a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
        {settingsOpen && (
          <SettingsPopover
            accent={accent}
            hideCompleted={hideCompleted}
            onSetAccent={onSetAccent}
            onSetHideCompleted={onSetHideCompleted}
          />
        )}
        <button type="button" className="icon-btn" onClick={onToggleReminders}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#54514a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
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
