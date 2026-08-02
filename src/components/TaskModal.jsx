import React from 'react';
import { mediaColor, fmtTimer } from '../lib/helpers';
import VoiceRecorder from './VoiceRecorder';

const TYPE_OPTS = [['task', 'Task'], ['meeting', 'Meeting']];
const STATUS_OPTS = [['todo', 'To do'], ['doing', 'In progress'], ['done', 'Done']];
const MEDIA_TYPES = [['link', 'Link'], ['doc', 'Doc'], ['voice', 'Voice'], ['note', 'Note'], ['image', 'Image']];

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

function MediaItemRow({ item, onRemove, onOpen }) {
  const c = mediaColor(item.type);
  const isImg = item.type === 'image' && item.url;
  const openable = item.type === 'link' || item.type === 'doc';

  const head = (
    <div className={'media-row-main' + (openable ? ' clickable' : '')} onClick={openable ? onOpen : undefined}>
      {isImg
        ? <div className="media-thumb" style={{ backgroundImage: `url('${item.url}')` }} />
        : <span className="media-icon" style={{ background: c.bg, color: c.fg }}>{c.icon}</span>}
      <div className="media-label-col">
        <div className="media-label">{item.name}</div>
        {item.type === 'link' && <div className="media-sub">{item.url}</div>}
        {item.type === 'voice' && item.duration != null && <div className="media-sub">{fmtTimer(item.duration)}</div>}
      </div>
      <button type="button" className="remove-x" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button>
    </div>
  );

  return (
    <div className="media-row">
      {head}
      {item.type === 'voice' && item.url && <audio className="media-audio" controls src={item.url} />}
      {item.type === 'note' && item.text && <div className="media-note-text">{item.text}</div>}
    </div>
  );
}

export default function TaskModal({
  form, projects, showNudge, onChange, onSave, onCancel, onDelete, onAddSub, onToggleSub, onRemoveSub,
  onRemoveMedia, onImage, onDocFile, onAddLink, onAddNote, onAddVoice, onOpenMedia,
}) {
  const isEditing = !!form.id;
  const mediaType = form._mediaType || 'link';

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0bab0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
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
              <label className="field-label">Priority <span className="hint">(1 = highest)</span></label>
              <input
                type="number"
                min="1"
                step="1"
                className="input sm priority-input"
                value={form.priority === '' || form.priority == null ? '' : form.priority}
                onChange={(e) => onChange({ priority: e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1) })}
              />
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
            {showNudge && (
              <div className="nudge-banner">This task's been open a while — want to break it into a few smaller steps?</div>
            )}
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

            {(form.media || []).length > 0 && (
              <div className="media-list">
                {form.media.map((mm) => (
                  <MediaItemRow key={mm.id} item={mm} onRemove={() => onRemoveMedia(mm.id)} onOpen={() => onOpenMedia(mm)} />
                ))}
              </div>
            )}

            <div className="media-type-seg">
              {MEDIA_TYPES.map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  className={'seg-btn' + (mediaType === k ? ' active' : '')}
                  onClick={() => onChange({ _mediaType: k })}
                >
                  {l}
                </button>
              ))}
            </div>

            {mediaType === 'link' && (
              <div className="media-add-row">
                <input
                  className="input sm"
                  style={{ flex: 1 }}
                  placeholder="https://…"
                  value={form._mediaUrl || ''}
                  onChange={(e) => onChange({ _mediaUrl: e.target.value })}
                />
                <input
                  className="input sm"
                  style={{ flex: 1 }}
                  placeholder="Label (optional)"
                  value={form._mediaName || ''}
                  onChange={(e) => onChange({ _mediaName: e.target.value })}
                />
                <button type="button" className="btn-ghost" onClick={onAddLink}>Add</button>
              </div>
            )}

            {mediaType === 'doc' && (
              <label className="upload-label">
                + Choose file
                <input type="file" style={{ display: 'none' }} onChange={onDocFile} />
              </label>
            )}

            {mediaType === 'voice' && <VoiceRecorder onRecorded={onAddVoice} />}

            {mediaType === 'note' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  className="input sm"
                  placeholder="Title (optional)"
                  value={form._mediaName || ''}
                  onChange={(e) => onChange({ _mediaName: e.target.value })}
                />
                <textarea
                  className="input textarea media-note-textarea"
                  style={{ minHeight: 50 }}
                  placeholder="Write a quick note…"
                  value={form._mediaNoteText || ''}
                  onChange={(e) => onChange({ _mediaNoteText: e.target.value })}
                />
                <button type="button" className="btn-ghost" onClick={onAddNote} style={{ alignSelf: 'flex-start' }}>Add note</button>
              </div>
            )}

            {mediaType === 'image' && (
              <label className="upload-label">
                + Upload image
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onImage} />
              </label>
            )}
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
