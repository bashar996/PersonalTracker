import React from 'react';
import TaskRow from '../TaskRow';
import { sortByDue, projectById } from '../../lib/helpers';

export default function AllTasksView({ projects, visibleTasks, filters, onFilterChange, onOpenTask, onToggleStatus, accent, colorUrgency, reduceClutter }) {
  const filtered = visibleTasks.slice().sort(sortByDue);

  return (
    <div className="view-wrap">
      <div className="filters-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
        <select className="filter-select" value={filters.status} onChange={(e) => onFilterChange({ status: e.target.value })}>
          <option value="all">All statuses</option>
          <option value="todo">To do</option>
          <option value="doing">In progress</option>
          <option value="done">Done</option>
        </select>
        <select className="filter-select" value={filters.priority} onChange={(e) => onFilterChange({ priority: e.target.value })}>
          <option value="all">Any priority</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <select className="filter-select" value={filters.projectId} onChange={(e) => onFilterChange({ projectId: e.target.value })}>
          <option value="all">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-plain">No tasks match these filters.</div>
      ) : (
        <div className="card-list">
          {filtered.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              project={projectById(projects, t.projectId)}
              accent={accent}
              colorUrgency={colorUrgency}
              reduceClutter={reduceClutter}
              onOpen={onOpenTask}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
