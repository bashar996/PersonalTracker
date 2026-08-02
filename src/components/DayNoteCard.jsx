import React from 'react';
import MarkdownPreview from './MarkdownPreview';

export default function DayNoteCard({ icon, label, value, editing, emptyLabel, placeholder, onChange, onBlur, onToggleEdit, boardStyle }) {
  return (
    <div className={boardStyle ? 'board-notecard' : ''}>
      <div className="notecard-head">
        <h2 className="notecard-title"><span>{icon}</span>{label}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {editing && <span className="notecard-hint">Markdown supported</span>}
          {!editing && (
            <button type="button" className="notecard-edit-btn" onClick={onToggleEdit}>
              <svg width={boardStyle ? '12' : '13'} height={boardStyle ? '12' : '13'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
              {!boardStyle && 'Edit'}
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <textarea className="notecard-textarea" value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} />
      ) : (
        <div className="notecard-preview" onClick={onToggleEdit}>
          <MarkdownPreview text={value} emptyLabel={emptyLabel} />
        </div>
      )}
    </div>
  );
}
