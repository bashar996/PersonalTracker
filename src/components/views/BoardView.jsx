import React from 'react';
import TaskRow from '../TaskRow';
import DayNoteCard from '../DayNoteCard';
import { sortByDue, priorityColor, ymd } from '../../lib/helpers';

export default function BoardView({
  projects, tasks, hideCompleted, onOpenTask, onToggleStatus, onAddTask,
  accent, colorUrgency, reduceClutter,
  notes, onNoteInput, notesEditing, onToggleNotesEdit, onExitNotesEdit,
}) {
  const now = new Date();
  const todayKey = ymd(now);
  const amKey = todayKey + '_am', pmKey = todayKey + '_pm';
  const amRaw = (notes || {})[amKey] || '', pmRaw = (notes || {})[pmKey] || '';
  const amEditing = (notesEditing || {}).today_am ?? !amRaw;
  const pmEditing = (notesEditing || {}).today_pm ?? !pmRaw;

  return (
    <>
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
                {ts.map((t) => {
                  const pr = Number(t.priority) || 0;
                  return (
                    <div className="board-task-wrap" key={t.id}>
                      {pr > 0 && <div className="board-priority-strip" style={{ background: priorityColor(pr) }} />}
                      <TaskRow task={t} project={p} accent={accent} colorUrgency={colorUrgency} reduceClutter={reduceClutter} onOpen={onOpenTask} onToggleStatus={onToggleStatus} />
                    </div>
                  );
                })}
                {ts.length === 0 && <div className="board-empty">No tasks</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="boardnotes-grid">
        <DayNoteCard
          boardStyle icon="☀️" label="Start of day" value={amRaw} editing={amEditing}
          emptyLabel="What's the plan for today?" placeholder="Intentions, priorities, how you're feeling…"
          onChange={(e) => onNoteInput(amKey, 'today_am', e.target.value)} onBlur={() => onExitNotesEdit('today_am', amRaw)} onToggleEdit={() => onToggleNotesEdit('today_am')}
        />
        <DayNoteCard
          boardStyle icon="🌙" label="End of day" value={pmRaw} editing={pmEditing}
          emptyLabel="How did today go?" placeholder="Wins, blockers, what to carry into tomorrow…"
          onChange={(e) => onNoteInput(pmKey, 'today_pm', e.target.value)} onBlur={() => onExitNotesEdit('today_pm', pmRaw)} onToggleEdit={() => onToggleNotesEdit('today_pm')}
        />
      </div>
    </>
  );
}
