import React from 'react';

export default function ProjectsView({ projects, tasks, onOpenProject, onAddProject }) {
  return (
    <div className="view-wrap-wide">
      <div className="projects-grid">
        {projects.map((p) => {
          const ts = tasks.filter((t) => t.projectId === p.id);
          const done = ts.filter((t) => t.status === 'done').length;
          const openCount = ts.length - done;
          const pct = ts.length ? Math.round((done / ts.length) * 100) : 0;
          return (
            <button type="button" className="project-card" key={p.id} onClick={() => onOpenProject(p.id)}>
              <div className="project-card-head">
                <span className="project-dot dot" style={{ background: p.color }} />
                <span className="project-card-name">{p.name}</span>
              </div>
              <div className="project-card-status">{openCount} open · {done} done</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: pct + '%', background: p.color }} />
              </div>
            </button>
          );
        })}
        <button type="button" className="new-project-card" onClick={onAddProject}>+ New project</button>
      </div>
    </div>
  );
}
