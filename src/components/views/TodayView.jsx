import React from 'react';
import TaskRow from '../TaskRow';
import { dueInfo, sortByDue, projectById } from '../../lib/helpers';

export default function TodayView({ tasks, projects, onOpenTask, onToggleStatus }) {
  const openTasks = tasks.filter((t) => t.status !== 'done');
  const cat = { overdue: [], today: [], upcoming: [] };
  openTasks.forEach((t) => {
    const di = dueInfo(t);
    if (!di) return;
    if (di.kind === 'overdue') cat.overdue.push(t);
    else if (di.kind === 'today') cat.today.push(t);
    else cat.upcoming.push(t);
  });
  cat.overdue.sort(sortByDue);
  cat.today.sort(sortByDue);
  cat.upcoming.sort(sortByDue);

  const stat = {
    overdue: cat.overdue.length,
    today: cat.today.length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const allClear = cat.overdue.length === 0 && cat.today.length === 0 && cat.upcoming.length === 0;

  const renderList = (list) => (
    <div className="card-list">
      {list.map((t) => (
        <TaskRow key={t.id} task={t} project={projectById(projects, t.projectId)} onOpen={onOpenTask} onToggleStatus={onToggleStatus} />
      ))}
    </div>
  );

  return (
    <div className="view-wrap">
      <div className="pt-stats">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#b0473b' }}>{stat.overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#26241f' }}>{stat.today}</div>
          <div className="stat-label">Due today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#26241f' }}>{stat.doing}</div>
          <div className="stat-label">In progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#5c7a68' }}>{stat.done}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {cat.overdue.length > 0 && (
        <div className="section-block">
          <h2 className="section-title overdue">Overdue</h2>
          {renderList(cat.overdue)}
        </div>
      )}

      {cat.today.length > 0 && (
        <div className="section-block">
          <h2 className="section-title">Today</h2>
          {renderList(cat.today)}
        </div>
      )}

      {cat.upcoming.length > 0 && (
        <div className="section-block">
          <h2 className="section-title">Upcoming</h2>
          {renderList(cat.upcoming)}
        </div>
      )}

      {allClear && (
        <div className="empty-state">
          <div className="headline">All clear</div>
          <div className="body">Nothing overdue or due today. Nice.</div>
        </div>
      )}
    </div>
  );
}
