import React from 'react';

const NAV_DEF = [
  { key: 'today', label: 'Today' },
  { key: 'board', label: 'Board' },
  { key: 'projects', label: 'Projects' },
  { key: 'all', label: 'All tasks' },
  { key: 'calendar', label: 'Calendar' },
];

export default function Sidebar({
  navOpen, view, selectedProjectId, projects, todayCount, allOpenCount,
  projectOpenCounts, onNavigate, onOpenProject, onAddProject, onOpenSettings,
}) {
  return (
    <aside className={'pt-side' + (navOpen ? ' pt-open' : '')}>
      <div className="pt-brand">
        <div className="pt-brand-mark">t</div>
        <span className="pt-brand-name">Tracker</span>
      </div>

      <nav className="pt-nav">
        {NAV_DEF.map((n) => {
          const active = view === n.key;
          const count = n.key === 'today' ? todayCount : n.key === 'all' ? allOpenCount : 0;
          return (
            <button
              key={n.key}
              type="button"
              className={'nav-item' + (active ? ' active' : '')}
              onClick={() => onNavigate(n.key)}
            >
              <span>{n.label}</span>
              {count > 0 && <span className="nav-count">{count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="pt-projects-head">
        <span className="pt-projects-label">Projects</span>
        <button type="button" className="round-add-btn" onClick={onAddProject}>+</button>
      </div>
      <div className="pt-project-list">
        {projects.map((p) => {
          const active = view === 'project' && selectedProjectId === p.id;
          const count = projectOpenCounts[p.id] || 0;
          return (
            <button
              key={p.id}
              type="button"
              className={'project-item' + (active ? ' active' : '')}
              onClick={() => onOpenProject(p.id)}
            >
              <span className="project-dot" style={{ background: p.color }} />
              <span className="name">{p.name}</span>
              {count > 0 && <span className="count">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="pt-sidebar-foot">
        <button type="button" className="settings-btn" onClick={onOpenSettings}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8578" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          Settings
        </button>
      </div>
    </aside>
  );
}
