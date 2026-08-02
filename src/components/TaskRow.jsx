import React from 'react';
import { dueInfo, urgencyDotColor } from '../lib/helpers';

export default function TaskRow({ task, project, accent, colorUrgency, reduceClutter, onOpen, onToggleStatus }) {
  const done = task.status === 'done';
  const di = dueInfo(task);
  const tags = reduceClutter ? [] : (task.tags || []);
  const subtasks = task.subtasks || [];
  const doneSub = subtasks.filter((s) => s.done).length;
  const media = task.media || [];
  const isMeeting = task.type === 'meeting' && !reduceClutter;

  const statusCls = 'status-dot' + (done ? ' done' : task.status === 'doing' ? ' doing' : '');
  const dueCls = 'task-due' + (di ? ' ' + di.kind : '');
  const uColor = colorUrgency && !done && di ? urgencyDotColor(di.kind, accent) : null;

  return (
    <div className="task-row" onClick={() => onOpen(task.id)}>
      <button
        type="button"
        className={statusCls}
        onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id); }}
      >
        {done ? '✓' : task.status === 'doing' ? '●' : ''}
      </button>
      <div className="task-main">
        <div className="task-top-row">
          <span className={'task-title' + (done ? ' done' : '')}>{task.title || 'Untitled'}</span>
          <div className="task-meta-icons">
            {subtasks.length > 0 && !reduceClutter && (
              <span className="meta-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b3ada0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l2 2 3-3" /><path d="M4 15l2 2 3-3" /><line x1="13" y1="6" x2="20" y2="6" /><line x1="13" y1="16" x2="20" y2="16" /></svg>
                {doneSub}/{subtasks.length}
              </span>
            )}
            {media.length > 0 && !reduceClutter && (
              <span className="meta-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b3ada0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.19a1 1 0 0 1-1.41-1.41l8.49-8.49" /></svg>
                {media.length}
              </span>
            )}
          </div>
        </div>
        <div className="task-bottom-row">
          <span className="task-project">
            <span className="project-dot" style={{ background: project ? project.color : '#999' }} />
            {project ? project.name : '—'}
          </span>
          {di && (
            <span className="task-due-wrap">
              {uColor && <span className="urgency-dot" style={{ background: uColor }} />}
              <span className={dueCls}>{di.label}</span>
            </span>
          )}
          {isMeeting && <span className="badge-meeting">Meeting</span>}
          {tags.length > 0 && (
            <span className="tag-row">
              {tags.map((tg) => <span className="chip" key={tg}>#{tg}</span>)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
