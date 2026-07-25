import React from 'react';
import { mediaColor } from '../lib/helpers';

const TYPE_OPTS = [['task', 'Task'], ['meeting', 'Meeting']];
const STATUS_OPTS = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']];
const PRIO_OPTS = [['low', 'Low'], ['med', 'Med'], ['high', 'High']];
const MEDIA_TYPES = [['link', 'Link'], ['doc', 'Doc'], ['voice', 'Voice'], ['note', 'Note']];

function Seg({ options, value, onPick, tight }) {
  return (
    <div className={'seg-row' + (tight ? ' tight' : '')}>
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={'seg-btn' + (value === key ? ' active' : '')}
          onClick={() => onPick(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function TaskModal({ form, projects, onChange, onSave, onCancel, onDelete, onAddSub, onToggleSub, onRemoveSub, onAddMedia, onRemoveMedia, onImage }) {
  const isEditing = !!form.id;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title-wrap">
          <input
            className="modal-title-input"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div className="modal-body">
          <Seg options={TYPE_OPTS} value={form.type} onPick={(v) => onChange({ type: v })} />

          <div>
            <label className="field-label">Status</label>
            <Seg options={STATUS_OPTS} value={form.status} onPick={(v) => onChange({ status: v })} />
          </div>

          <div className="field-row stack-mobile">
            <div className="field">
              <label className="field-label">Project</label>
              <select className="input" value={form.projectId} onChange={(e) => onChange({ projectId: e.target.value })}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Priority</label>
              <Seg options={PRIO_OPTS} value={form.priority} onPick={(v) => onChange({ priority: v })} tight />
            </div>
          </div>

          <div className="field-row stack-mobile">
            <div className="field">
              <label className="field-label">Due</label>
              <input type="datetime-local" className="input sm" value={form.due || ''} onChange={(e) => onChange({ due: e.target.value })} />
            </div>
            <div className="field">
              <label className="field-label">Reminder</label>
              <input type="datetime-local" className="input sm" value={form.reminder || ''} onChange={(e) => onChange({ reminder: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="field-label">Notes</label>
            <textarea className="input textarea" placeholder="Add details…" value={form.notes || ''} onChange={(e) => onChange({ notes: e.target.value })} />
          </div>

          <div>
            <label className="field-label">Subtasks</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 9 }}>
              {(form.subtasks || []).map((s) => (
                <div className="subtask-row" key={s.id}>
                  <button type="button" className={'subtask-check' + (s.done ? ' done' : '')} onClick={() => onToggleSub(s.id)}>
                    {s.done ? '✓' : ''}
                  </button>
                  <span className={'subtask-text' + (s.done ? ' done' : '')}>{s.text}</span>
                  <button type="button" className="remove-x" onClick={() => onRemoveSub(s.id)}>×</button>
                </div>
              ))}
            </div>
            <input
              className="input sm"
              placeholder="Add subtask, press Enter"
              value={form._newSub || ''}
              onChange={(e) => onChange({ _newSub: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddSub(); } }}
            />
          </div>

          <div>
            <label className="field-label">Tags</label>
            <input
              className="input sm"
              placeholder="comma, separated, tags"
              value={form._tagsText || ''}
              onChange={(e) => onChange({ _tagsText: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Media</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 9 }}>
              {(form.media || []).map((mm) => {
                const c = mediaColor(mm.type);
                const isImg = mm.type === 'image' && mm.url;
                return (
                  <div className="media-row" key={mm.id}>
                    {isImg
                      ? <div className="media-thumb" style={{ backgroundImage: `url('${mm.url}')` }} />
                      : <span className="media-icon" style={{ background: c.bg, color: c.fg }}>{c.icon}</span>}
                    <span className="media-label">{mm.name}</span>
                    <button type="button" className="remove-x" onClick={() => onRemoveMedia(mm.id)}>×</button>
                  </div>
                );
              })}
            </div>
            <div className="media-add-row">
              <input
                className="input sm"
                style={{ flex: 1 }}
                placeholder="Link, doc or note name"
                value={form._mediaName || ''}
                onChange={(e) => onChange({ _mediaName: e.target.value })}
              />
              <select className="filter-select" value={form._mediaType || 'link'} onChange={(e) => onChange({ _mediaType: e.target.value })}>
                {MEDIA_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <button type="button" className="btn-ghost" onClick={onAddMedia}>Add</button>
            </div>
            <label className="upload-label">
              + Upload image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onImage} />
            </label>
          </div>
        </div>

        <div className="modal-footer">
          {isEditing ? <button type="button" className="btn-danger-text" onClick={onDelete}>Delete</button> : <span />}
          <div className="modal-footer-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="button" className="btn-primary" onClick={onSave}>Save task</button>
          </div>
        </div>
      </div>
    </div>
  );
}
