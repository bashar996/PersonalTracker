import React from 'react';
import TaskRow from '../TaskRow';
import { sortByDue } from '../../lib/helpers';

export default function BoardView({ projects, tasks, hideCompleted, onOpenTask, onToggleStatus, onAddTask }) {
  return (
    <div className="board-row">
      {projects.map((p) => {
        let ts = tasks.filter((t) => t.projectId === p.id);
        if (hideCompleted) ts = ts.filter((t) => t.status !== 'done');
        ts = ts.slice().sort(sortByDue);
        const open = ts.filter((t) => t.status !== 'done').length;
        return (
          <div className="board-col" key={p.id}>
            <div className="board-accent-bar" style={{ background: p.color }} />
            <div className="board-col-head">
              <span className="project-dot" style={{ background: p.color }} />
              <span className="board-col-name">{p.name}</span>
              <span className="board-col-count">{open} open</span>
              <button type="button" className="round-add-btn" onClick={() => onAddTask(p.id)}>+</button>
            </div>
            <div className="board-col-body">
              {ts.map((t) => (
                <div className="board-task-wrap" key={t.id}>
                  <TaskRow task={t} project={p} onOpen={onOpenTask} onToggleStatus={onToggleStatus} />
                </div>
              ))}
              {ts.length === 0 && <div className="board-empty">No tasks</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
