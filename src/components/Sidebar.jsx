import React from 'react';

const NAV_DEF = [
  { key: 'board', label: 'Board' },
  { key: 'today', label: 'Today' },
  { key: 'projects', label: 'Projects' },
  { key: 'all', label: 'All tasks' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'settings', label: 'Settings' },
];

const ICONS = {
  today: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 12l3 3 5-6" /></svg>,
  board: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>,
  projects: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>,
  all: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1.4" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.4" fill="currentColor" stroke="none" /></svg>,
  calendar: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="3" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></svg>,
  settings: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
};

export default function Sidebar({
  navOpen, collapsed, onToggleCollapse,
  view, selectedProjectId, projects, todayCount, allOpenCount,
  projectOpenCounts, onNavigate, onOpenProject, onAddProject,
  workspaces, activeWorkspaceId, wsMenuOpen, onToggleWsMenu, onSwitchWorkspace, onEditWorkspace, onNewWorkspace,
}) {
  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || { name: '', color: '#999' };
  const showText = !collapsed;

  return (
    <aside className={'pt-side' + (navOpen ? ' pt-open' : '') + (collapsed ? ' collapsed' : '')}>
      <div className="pt-brand">
        <div className="pt-brand-mark">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6.5h11" /><path d="M4 12h7" /><path d="M13.5 15.5l3 3 6-6.5" /></svg>
        </div>
        {showText && <span className="pt-brand-name">Tracker</span>}
        <button type="button" className="collapse-btn pt-collapsebtn" onClick={onToggleCollapse}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease' }}><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      </div>

      <div className="ws-wrap">
        <button type="button" className="ws-btn" onClick={onToggleWsMenu}>
          <span className="ws-dot" style={{ background: activeWs.color }} />
          {showText && <span className="ws-name">{activeWs.name}</span>}
          {showText && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ptt-muted)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginLeft: 'auto' }}><path d="M6 9l6 6 6-6" /></svg>}
        </button>
        {wsMenuOpen && (
          <div className="ws-menu">
            <div className="ws-menu-label">Workspaces</div>
            <div className="ws-menu-list">
              {workspaces.map((w) => (
                <div className={'ws-row' + (w.id === activeWorkspaceId ? ' active' : '')} key={w.id}>
                  <button type="button" className="ws-row-select" onClick={() => onSwitchWorkspace(w.id)}>
                    <span className="ws-dot" style={{ background: w.color }} />
                    <span className="ws-row-name">{w.name}</span>
                  </button>
                  <button type="button" className="ws-row-edit" onClick={() => onEditWorkspace(w.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="ws-new-row" onClick={onNewWorkspace}>+ New workspace</button>
          </div>
        )}
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
              title={n.label}
            >
              <span className="nav-item-label">
                {ICONS[n.key]}
                {showText && <span>{n.label}</span>}
              </span>
              {count > 0 && showText && <span className="nav-count">{count}</span>}
            </button>
          );
        })}
      </nav>

      {showText && (
        <div className="pt-projects-head">
          <span className="pt-projects-label">Projects</span>
          <button type="button" className="round-add-btn" onClick={onAddProject}>+</button>
        </div>
      )}
      {collapsed && <div style={{ height: 22 }} />}
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
              title={p.name}
            >
              <span className="project-dot" style={{ background: p.color }} />
              {showText && <span className="name">{p.name}</span>}
              {count > 0 && showText && <span className="count">{count}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
