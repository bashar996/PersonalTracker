import React from 'react';
import TaskRow from '../TaskRow';
import { sortByDue } from '../../lib/helpers';

export default function ProjectDetailView({ project, tasks, onOpenTask, onToggleStatus, onAddTask, onEditProject }) {
  if (!project) return null;
  const ts = tasks.filter((t) => t.projectId === project.id);
  const done = ts.filter((t) => t.status === 'done');
  const doing = ts.filter((t) => t.status === 'doing').slice().sort(sortByDue);
  const todo = ts.filter((t) => t.status === 'todo').slice().sort(sortByDue);
  const doneSorted = done.slice().sort(sortByDue);
  const pct = ts.length ? Math.round((done.length / ts.length) * 100) : 0;

  const renderList = (list) => (
    <div className="card-list">
      {list.map((t) => (
        <TaskRow key={t.id} task={t} project={project} onOpen={onOpenTask} onToggleStatus={onToggleStatus} />
      ))}
    </div>
  );

  return (
    <div className="view-wrap">
      <div className="pd-head">
        <div className="progress-track lg">
          <div className="progress-fill" style={{ width: pct + '%', background: project.color }} />
        </div>
        <div className="pd-actions">
          <button type="button" className="btn-ghost" onClick={() => onEditProject(project.id)}>Edit</button>
          <button type="button" className="btn-ghost" onClick={() => onAddTask(project.id)}>+ Task</button>
        </div>
      </div>

      {doing.length > 0 && (
        <div className="section-block">
          <h2 className="section-title">In progress · {doing.length}</h2>
          {renderList(doing)}
        </div>
      )}
      {todo.length > 0 && (
        <div className="section-block">
          <h2 className="section-title">To do · {todo.length}</h2>
          {renderList(todo)}
        </div>
      )}
      {doneSorted.length > 0 && (
        <div className="section-block">
          <h2 className="section-title">Done · {doneSorted.length}</h2>
          {renderList(doneSorted)}
        </div>
      )}
    </div>
  );
}
