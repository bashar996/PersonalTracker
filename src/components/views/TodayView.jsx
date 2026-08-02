import React from 'react';
import TaskRow from '../TaskRow';
import DayNoteCard from '../DayNoteCard';
import { dueInfo, sortByDue, projectById, fmtTimer, ymd } from '../../lib/helpers';

const CHEVRON = (collapsed) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={'section-chevron' + (collapsed ? ' collapsed' : '')}><path d="M6 9l6 6 6-6" /></svg>
);

export default function TodayView({
  tasks, projects, accent, colorUrgency, reduceClutter, onOpenTask, onToggleStatus,
  collapsedSections, onToggleSection,
  focusModeOn, bodyTimerOn, focusIndex, onFocusSkip, onFocusMarkDone,
  timerState, onTimerToggle, onTimerReset,
  oneThingOn,
  notes, onSetNote, notesEditing, onToggleNotesEdit, onExitNotesEdit,
}) {
  const now = new Date();
  const openTasks = tasks.filter((t) => t.status !== 'done');
  const cat = { overdue: [], today: [], upcoming: [] };
  openTasks.forEach((t) => {
    const di = dueInfo(t, now);
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

  if (focusModeOn) {
    const focusQueue = cat.overdue.concat(cat.today, cat.upcoming);
    const idx = Math.min(focusIndex, Math.max(0, focusQueue.length - 1));
    const focusTask = focusQueue.length ? focusQueue[idx] : null;
    const remaining = Math.max(0, focusQueue.length - 1 - idx);
    const project = focusTask ? projectById(projects, focusTask.projectId) : null;
    const di = focusTask ? dueInfo(focusTask, now) : null;
    const timerActive = focusTask && timerState.taskId === focusTask.id;
    const timerRunning = timerActive && timerState.running;

    return (
      <div className="focus-wrap">
        <div className="focus-eyebrow">Focus mode</div>
        {focusTask ? (
          <div className="focus-card">
            <div className="focus-title">{focusTask.title}</div>
            <div className="focus-meta">
              <span className="project-dot" style={{ background: project ? project.color : '#999' }} />
              <span style={{ font: "500 13px 'Instrument Sans'", color: 'var(--ptt-muted)' }}>{project ? project.name : '—'}</span>
              {di && <span className={'task-due ' + di.kind}>{di.label}</span>}
            </div>
            {bodyTimerOn && (
              <div className="focus-timer-row">
                <div className="focus-timer-value">{fmtTimer(timerActive ? timerState.seconds : 0)}</div>
                <button type="button" className="focus-timer-btn" onClick={() => onTimerToggle(focusTask.id)}>{timerRunning ? 'Pause' : 'Start'}</button>
                <button type="button" className="focus-timer-reset" onClick={() => onTimerReset(focusTask.id)}>Reset</button>
              </div>
            )}
            <div className="focus-actions">
              <button type="button" className="focus-skip" onClick={onFocusSkip}>Skip</button>
              <button type="button" className="focus-done-btn" onClick={() => onFocusMarkDone(focusTask.id)}>Mark done</button>
            </div>
            <div className="focus-remaining">{remaining > 0 ? remaining + ' more after this' : 'Last one'}</div>
          </div>
        ) : (
          <div className="focus-empty">
            <div className="headline">All clear</div>
            <div className="body">Nothing left in the queue.</div>
          </div>
        )}
      </div>
    );
  }

  const topPriority = openTasks.filter((t) => Number(t.priority) === 1).sort(sortByDue);
  const topIds = new Set(topPriority.map((t) => t.id));

  let budget = oneThingOn ? 3 : Infinity;
  const takeBudget = (arr) => {
    if (budget <= 0) return [];
    const t = arr.slice(0, budget);
    budget -= t.length;
    return t;
  };
  const topPriorityShown = takeBudget(topPriority);
  const overdueShown = takeBudget(cat.overdue.filter((t) => !topIds.has(t.id)));
  const todayShown = takeBudget(cat.today.filter((t) => !topIds.has(t.id)));
  const upcomingShown = takeBudget(cat.upcoming.filter((t) => !topIds.has(t.id)));
  const oneThingHidden = (cat.overdue.length + cat.today.length + cat.upcoming.length) - (overdueShown.length + todayShown.length + upcomingShown.length);

  const allClear = cat.overdue.length === 0 && cat.today.length === 0 && cat.upcoming.length === 0;

  const cs = collapsedSections || {};
  const renderList = (list) => (
    <div className="card-list">
      {list.map((t) => (
        <TaskRow key={t.id} task={t} project={projectById(projects, t.projectId)} accent={accent} colorUrgency={colorUrgency} reduceClutter={reduceClutter} onOpen={onOpenTask} onToggleStatus={onToggleStatus} />
      ))}
    </div>
  );
  const renderSection = (key, title, list, titleClass) => list.length === 0 ? null : (
    <div className="section-block">
      <button type="button" className="section-head-row" onClick={() => onToggleSection(key)}>
        {CHEVRON(!!cs[key])}
        <h2 className={'section-title' + (titleClass ? ' ' + titleClass : '')}>{title}</h2>
      </button>
      {!cs[key] && renderList(list)}
    </div>
  );

  const todayKey = ymd(now);
  const amKey = todayKey + '_am', pmKey = todayKey + '_pm';
  const amRaw = (notes || {})[amKey] || '', pmRaw = (notes || {})[pmKey] || '';
  const amEditing = !!(notesEditing || {}).today_am || !amRaw;
  const pmEditing = !!(notesEditing || {}).today_pm || !pmRaw;

  return (
    <div className="view-wrap">
      <div className="pt-stats">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#b0473b' }}>{stat.overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--ptt-text)' }}>{stat.today}</div>
          <div className="stat-label">Due today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--ptt-text)' }}>{stat.doing}</div>
          <div className="stat-label">In progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#5c7a68' }}>{stat.done}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {renderSection('topPriority', 'Top priority', topPriorityShown, 'top-priority')}
      {renderSection('overdue', 'Overdue', overdueShown, 'overdue')}
      {renderSection('duetoday', 'Today', todayShown)}
      {renderSection('upcoming', 'Upcoming', upcomingShown)}

      {allClear && (
        <div className="empty-state">
          <div className="headline">All clear</div>
          <div className="body">Nothing overdue or due today. Nice.</div>
        </div>
      )}

      {oneThingHidden > 0 && (
        <div className="one-thing-hidden">+{oneThingHidden} more tucked away — One thing at a time is on in Settings</div>
      )}

      <div className="daynotes-grid">
        <DayNoteCard
          icon="☀️" label="Start of day" value={amRaw} editing={amEditing}
          emptyLabel="What's the plan for today?" placeholder="Intentions, priorities, how you're feeling…"
          onChange={(e) => onSetNote(amKey, e.target.value)} onBlur={() => onExitNotesEdit('today_am', amRaw)} onToggleEdit={() => onToggleNotesEdit('today_am')}
        />
        <DayNoteCard
          icon="🌙" label="End of day" value={pmRaw} editing={pmEditing}
          emptyLabel="How did today go?" placeholder="Wins, blockers, what to carry into tomorrow…"
          onChange={(e) => onSetNote(pmKey, e.target.value)} onBlur={() => onExitNotesEdit('today_pm', pmRaw)} onToggleEdit={() => onToggleNotesEdit('today_pm')}
        />
      </div>
    </div>
  );
}
