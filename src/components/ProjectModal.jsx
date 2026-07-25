import React from 'react';
import { PAL } from '../lib/helpers';

export default function ProjectModal({ form, onChange, onSave, onCancel, onDelete }) {
  const isEditing = !!form.id;

  return (
    <div className="modal-overlay project-overlay" onClick={onCancel}>
      <div className="modal modal-narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body tight">
          <div>
            <label className="field-label">Project name</label>
            <input
              className="input"
              style={{ fontSize: 15 }}
              placeholder="e.g. ServiceHub"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" style={{ marginBottom: 10 }}>Colour</label>
            <div className="swatch-row">
              {PAL.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="swatch"
                  style={{ background: c, boxShadow: form.color === c ? `0 0 0 2px #faf9f6, 0 0 0 4px ${c}` : 'none' }}
                  onClick={() => onChange({ color: c })}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {isEditing ? <button type="button" className="btn-danger-text" onClick={onDelete}>Delete</button> : <span />}
          <div className="modal-footer-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="button" className="btn-primary" onClick={onSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
