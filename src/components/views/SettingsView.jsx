import React from 'react';

const ACCENT_OPTIONS = ['#4a7862', '#3f5e8c', '#8a5a44', '#6a5a8c'];

const FOCUS_SETTINGS = [
  { key: 'focusMode', label: 'Focus mode', desc: 'Today view shows one task at a time with a Next button, instead of full lists.' },
  { key: 'bodyTimer', label: 'Body-doubling timer', desc: 'Adds a visible start/pause timer to the task modal to help sustain attention.' },
  { key: 'autoBreakNudge', label: 'Auto-break big tasks', desc: 'Nudges you to add subtasks when a task has sat open for a few days with no steps.' },
  { key: 'gentleReminders', label: 'Gentle reminders', desc: 'The reminder bell softly pulses when something needs attention, instead of a single alert.' },
  { key: 'reduceClutter', label: 'Reduce visual clutter', desc: 'Hides tags and attachment counts on task cards — just title, project, and due date.' },
  { key: 'oneThing', label: 'One thing at a time', desc: 'Today view shows only a few tasks at once, with the rest tucked away.' },
  { key: 'colorUrgency', label: 'Color-coded urgency', desc: "Adds a small color dot next to each task's due date based on how close it is." },
  { key: 'celebration', label: 'Completion celebration', desc: 'A small celebratory animation plays when you complete a task.' },
];

function Toggle({ on, onClick }) {
  return (
    <button type="button" className={'toggle-track' + (on ? ' on' : '')} onClick={onClick}>
      <span className="toggle-knob" />
    </button>
  );
}

export default function SettingsView({ accent, hideCompleted, settings, onSetAccent, onSetHideCompleted, onToggleSetting }) {
  return (
    <div className="view-wrap-settings">
      <div className="settings-section-label">Appearance</div>
      <div className="settings-list">
        <div className="settings-row settings-row-accent">
          <div className="settings-row-text">
            <div className="settings-row-label">Accent color</div>
            <div className="settings-row-desc">Used for buttons, highlights, and active states.</div>
          </div>
          <div className="swatch-row">
            {ACCENT_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className="swatch"
                style={{ width: 26, height: 26, borderRadius: 8, background: c, boxShadow: accent === c ? `0 0 0 2px var(--ptt-card), 0 0 0 4px ${c}` : 'none' }}
                onClick={() => onSetAccent(c)}
              />
            ))}
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-label">Hide completed tasks</div>
            <div className="settings-row-desc">Completed tasks won't show on the Board or in All tasks.</div>
          </div>
          <Toggle on={hideCompleted} onClick={() => onSetHideCompleted(!hideCompleted)} />
        </div>
      </div>

      <div className="settings-section-label">Focus &amp; attention</div>
      <div className="settings-intro" style={{ margin: '0 4px 12px' }}>
        These are optional features that can help with focus and attention. All off by default except two suggested starters — turn on whatever helps.
      </div>
      <div className="settings-list">
        {FOCUS_SETTINGS.map((sd) => (
          <div className="settings-row" key={sd.key}>
            <div className="settings-row-text">
              <div className="settings-row-label">{sd.label}</div>
              <div className="settings-row-desc">{sd.desc}</div>
            </div>
            <Toggle on={!!settings[sd.key]} onClick={() => onToggleSetting(sd.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}
