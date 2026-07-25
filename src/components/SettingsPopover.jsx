import React from 'react';

const ACCENT_OPTIONS = ['#4a7862', '#3f5e8c', '#8a5a44', '#6a5a8c'];

export default function SettingsPopover({ accent, hideCompleted, onSetAccent, onSetHideCompleted }) {
  return (
    <div className="popover" style={{ width: 260 }}>
      <div className="popover-title">Settings</div>
      <div className="settings-popover-body">
        <div>
          <label className="field-label">Accent color</label>
          <div className="swatch-row">
            {ACCENT_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className="swatch"
                style={{ background: c, boxShadow: accent === c ? `0 0 0 2px #faf9f6, 0 0 0 4px ${c}` : 'none' }}
                onClick={() => onSetAccent(c)}
              />
            ))}
          </div>
        </div>
        <label className="settings-check">
          <input type="checkbox" checked={hideCompleted} onChange={(e) => onSetHideCompleted(e.target.checked)} />
          Hide completed tasks
        </label>
      </div>
    </div>
  );
}
