import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';
import TodayView from './components/views/TodayView';
import BoardView from './components/views/BoardView';
import ProjectsView from './components/views/ProjectsView';
import ProjectDetailView from './components/views/ProjectDetailView';
import AllTasksView from './components/views/AllTasksView';
import CalendarView from './components/views/CalendarView';
import { seed } from './lib/seed';
import {
  uid, darken, rgba, ymd, dueInfo, projectById, filterTasks,
  fmtTime, fmtDate, MONTH_NAMES, WEEKDAY_NAMES, PAL,
} from './lib/helpers';

const DEFAULT_SETTINGS = { accent: '#4a7862', hideCompleted: false };
const DEFAULT_FILTERS = { search: '', status: 'all', priority: 'all', projectId: 'all' };

export default function App() {
  const [data, setDataState] = useState(null);
  const [view, setView] = useState('today');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [cal, setCal] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [calSel, setCalSel] = useState(() => ymd(new Date()));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // ---------- load / persist ----------
  useEffect(() => {
    let cancelled = false;
    window.api.loadData().then((d) => {
      if (cancelled) return;
      if (!d || !d.projects) d = seed();
      if (!d.settings) d.settings = { ...DEFAULT_SETTINGS };
      setDataState(d);
      window.api.saveData(d);
    });
    return () => { cancelled = true; };
  }, []);

  function persist(newData) {
    setDataState(newData);
    window.api.saveData(newData);
  }

  // ---------- notification click -> open task ----------
  useEffect(() => {
    const off = window.api.onNotificationClick((taskId) => openTask(taskId));
    return off;
  });

  // ---------- reminder polling ----------
  useEffect(() => {
    function checkReminders() {
      if (!data) return;
      const now = Date.now();
      let anyChange = false;
      const tasks = data.tasks.map((t) => {
        if (!t.reminder || t.status === 'done' || t.reminderFired) return t;
        const rt = new Date(t.reminder).getTime();
        if (rt > now) return t;
        anyChange = true;
        if (now - rt <= 24 * 3600000) {
          window.api.notify({ id: t.id, title: t.title, body: t.notes ? t.notes.slice(0, 120) : 'Reminder due' });
        }
        return { ...t, reminderFired: true };
      });
      if (anyChange) persist({ ...data, tasks });
    }
    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!data) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#a09a8c', font: "400 14px 'Instrument Sans'" }}>Loading…</div>;
  }

  const accent = data.settings.accent || DEFAULT_SETTINGS.accent;
  const hideCompleted = !!data.settings.hideCompleted;
  const projects = data.projects;
  const tasks = data.tasks;
  const now = new Date();

  // ---------- navigation ----------
  function go(v) { setView(v); setRemindersOpen(false); setSettingsOpen(false); setNavOpen(false); }
  function openProject(id) { setView('project'); setSelectedProjectId(id); setRemindersOpen(false); setSettingsOpen(false); setNavOpen(false); }
  function shiftMonth(delta) {
    setCal((c) => { let y = c.y, m = c.m + delta; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } return { y, m }; });
  }

  // ---------- task crud ----------
  function toForm(t) { return { ...t, _newSub: '', _tagsText: (t.tags || []).join(', '), _mediaName: '', _mediaType: 'link' }; }
  function openTask(id) {
    if (!data) return;
    const t = data.tasks.find((x) => x.id === id);
    if (!t) return;
    setForm(toForm(t));
    setModal('task');
    setRemindersOpen(false);
  }
  function newTask(projectId) {
    const first = (data.projects[0] || {}).id;
    setForm(toForm({ id: null, projectId: projectId || first, type: 'task', status: 'todo', priority: 'med', title: '', notes: '', due: '', reminder: '', tags: [], subtasks: [], media: [] }));
    setModal('task');
    setRemindersOpen(false);
  }
  function setFormPatch(patch) { setForm((f) => ({ ...f, ...patch })); }
  function cycleStatus(id) {
    const order = ['todo', 'doing', 'done'];
    const tasks = data.tasks.map((t) => (t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % 3] } : t));
    persist({ ...data, tasks });
  }
  function addSub() {
    const t = (form._newSub || '').trim();
    if (!t) return;
    setFormPatch({ subtasks: (form.subtasks || []).concat([{ id: uid(), text: t, done: false }]), _newSub: '' });
  }
  function toggleSub(id) { setFormPatch({ subtasks: form.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) }); }
  function removeSub(id) { setFormPatch({ subtasks: form.subtasks.filter((s) => s.id !== id) }); }
  function addMedia() {
    const n = (form._mediaName || '').trim();
    if (!n) return;
    setFormPatch({ media: (form.media || []).concat([{ id: uid(), type: form._mediaType, name: n }]), _mediaName: '' });
  }
  function removeMedia(id) { setFormPatch({ media: form.media.filter((m) => m.id !== id) }); }
  function onImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setFormPatch({ media: (form.media || []).concat([{ id: uid(), type: 'image', name: file.name, url: r.result }]) });
    r.readAsDataURL(file);
    e.target.value = '';
  }
  function saveTask() {
    const f = form;
    if (!f) return;
    const tags = (f._tagsText || '').split(',').map((s) => s.trim()).filter(Boolean);
    const original = f.id ? data.tasks.find((t) => t.id === f.id) : null;
    const reminderChanged = !original || (original.reminder || '') !== (f.reminder || '');
    const rec = {
      id: f.id || uid(),
      projectId: f.projectId,
      type: f.type,
      status: f.status,
      priority: f.priority,
      title: (f.title || '').trim() || 'Untitled',
      notes: f.notes || '',
      due: f.due || '',
      reminder: f.reminder || '',
      tags,
      subtasks: f.subtasks || [],
      media: f.media || [],
      createdAt: f.createdAt || Date.now(),
      reminderFired: reminderChanged ? false : !!(original && original.reminderFired),
    };
    const newTasks = f.id ? data.tasks.map((t) => (t.id === f.id ? rec : t)) : data.tasks.concat([rec]);
    persist({ ...data, tasks: newTasks });
    setModal(null);
    setForm(null);
  }
  function deleteTask() {
    if (form && form.id) persist({ ...data, tasks: data.tasks.filter((t) => t.id !== form.id) });
    setModal(null);
    setForm(null);
  }
  function closeModal() { setModal(null); setForm(null); }

  // ---------- project crud ----------
  function newProject() {
    setForm({ id: null, name: '', color: PAL[data.projects.length % PAL.length] });
    setModal('project');
    setRemindersOpen(false);
    setNavOpen(false);
  }
  function editProject(id) {
    const p = projectById(data.projects, id);
    if (p) setForm({ ...p });
    setModal('project');
  }
  function saveProject() {
    if (!form.name.trim()) return;
    const rec = { id: form.id || uid(), name: form.name.trim(), color: form.color };
    const newProjects = form.id ? data.projects.map((p) => (p.id === form.id ? rec : p)) : data.projects.concat([rec]);
    persist({ ...data, projects: newProjects });
    setModal(null);
    setForm(null);
    setSelectedProjectId(rec.id);
    setView('project');
  }
  function deleteProject() {
    if (form && form.id) {
      persist({
        ...data,
        projects: data.projects.filter((p) => p.id !== form.id),
        tasks: data.tasks.filter((t) => t.projectId !== form.id),
      });
    }
    setModal(null);
    setForm(null);
    setView('projects');
  }

  // ---------- settings ----------
  function setAccent(color) { persist({ ...data, settings: { ...data.settings, accent: color } }); }
  function setHideCompleted(v) { persist({ ...data, settings: { ...data.settings, hideCompleted: v } }); }

  // ---------- derived values ----------
  const accentDark = darken(accent, 0.2);
  const accentTint = rgba(accent, 0.12);
  const accentTintStrong = rgba(accent, 0.2);
  const cssVars = { '--accent': accent, '--accent-dark': accentDark, '--accent-tint': accentTint, '--accent-tint-strong': accentTintStrong };

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const cat = { overdue: [], today: [], upcoming: [] };
  openTasks.forEach((t) => {
    const di = dueInfo(t, now);
    if (!di) return;
    if (di.kind === 'overdue') cat.overdue.push(t);
    else if (di.kind === 'today') cat.today.push(t);
    else cat.upcoming.push(t);
  });

  const projectOpenCounts = {};
  projects.forEach((p) => { projectOpenCounts[p.id] = tasks.filter((t) => t.projectId === p.id && t.status !== 'done').length; });

  const visibleTasks = filterTasks(tasks, filters, hideCompleted);

  const remTasks = tasks.filter((t) => t.reminder && t.status !== 'done').slice().sort((a, b) => (a.reminder < b.reminder ? -1 : 1));
  const reminders = remTasks.map((t) => {
    const rd = new Date(t.reminder);
    const diffMin = (rd - now) / 60000;
    let whenLabel;
    if (diffMin < 0) whenLabel = 'Overdue';
    else if (diffMin < 60) whenLabel = 'in ' + Math.max(1, Math.round(diffMin)) + ' min';
    else if (rd.getDate() === now.getDate() && diffMin < 1440) whenLabel = 'Today ' + fmtTime(rd);
    else {
      const tmr = new Date(now); tmr.setDate(now.getDate() + 1);
      whenLabel = rd.getDate() === tmr.getDate() ? 'Tomorrow ' + fmtTime(rd) : fmtDate(rd) + ' ' + fmtTime(rd);
    }
    const proj = projectById(projects, t.projectId) || { color: '#999' };
    return { id: t.id, title: t.title, whenLabel, overdue: diffMin < 0, soon: diffMin < 180, color: proj.color };
  });
  const reminderBadge = tasks.filter((t) => t.reminder && t.status !== 'done' && (new Date(t.reminder) - now) < 24 * 3600000).length;

  let pd = null;
  if (view === 'project') {
    const p = projectById(projects, selectedProjectId) || projects[0];
    if (p) {
      const ts = tasks.filter((t) => t.projectId === p.id);
      const done = ts.filter((t) => t.status === 'done').length;
      pd = { project: p, meta: ts.length + ' tasks · ' + done + ' done' };
    }
  }

  const dateLabel = WEEKDAY_NAMES[now.getDay()] + ', ' + MONTH_NAMES[now.getMonth()] + ' ' + now.getDate();
  const monthLabel = MONTH_NAMES[cal.m] + ' ' + cal.y;
  const titles = {
    today: ['Today', dateLabel],
    board: ['Board', projects.length + ' projects · ' + openTasks.length + ' open'],
    projects: ['Projects', projects.length + ' active'],
    project: [pd ? pd.project.name : 'Project', pd ? pd.meta : ''],
    all: ['All tasks', visibleTasks.length + ' shown'],
    calendar: ['Calendar', monthLabel],
  };
  const [title, subtitle] = titles[view] || ['', ''];

  return (
    <div className="pt-shell" style={cssVars}>
      <div className="pt-app">
        <div className={'pt-backdrop' + (navOpen ? ' pt-show' : '')} onClick={() => setNavOpen(false)} />
        <Sidebar
          navOpen={navOpen}
          view={view}
          selectedProjectId={selectedProjectId}
          projects={projects}
          todayCount={cat.overdue.length + cat.today.length}
          allOpenCount={openTasks.length}
          projectOpenCounts={projectOpenCounts}
          onNavigate={go}
          onOpenProject={openProject}
          onAddProject={newProject}
          onOpenSettings={() => { setSettingsOpen((s) => !s); setRemindersOpen(false); }}
        />
        <main className="pt-main">
          <Header
            title={title}
            subtitle={subtitle}
            onToggleNav={() => setNavOpen((s) => !s)}
            onNewTask={() => newTask()}
            remindersOpen={remindersOpen}
            onToggleReminders={() => { setRemindersOpen((s) => !s); setSettingsOpen(false); }}
            reminders={reminders}
            reminderBadge={reminderBadge}
            onOpenTask={openTask}
            settingsOpen={settingsOpen}
            onToggleSettings={() => { setSettingsOpen((s) => !s); setRemindersOpen(false); }}
            accent={accent}
            hideCompleted={hideCompleted}
            onSetAccent={setAccent}
            onSetHideCompleted={setHideCompleted}
          />
          <div className="pt-content">
            {view === 'today' && (
              <TodayView tasks={tasks} projects={projects} onOpenTask={openTask} onToggleStatus={cycleStatus} />
            )}
            {view === 'board' && (
              <BoardView projects={projects} tasks={tasks} hideCompleted={hideCompleted} onOpenTask={openTask} onToggleStatus={cycleStatus} onAddTask={newTask} />
            )}
            {view === 'projects' && (
              <ProjectsView projects={projects} tasks={tasks} onOpenProject={openProject} onAddProject={newProject} />
            )}
            {view === 'project' && pd && (
              <ProjectDetailView project={pd.project} tasks={tasks} onOpenTask={openTask} onToggleStatus={cycleStatus} onAddTask={newTask} onEditProject={editProject} />
            )}
            {view === 'all' && (
              <AllTasksView projects={projects} visibleTasks={visibleTasks} filters={filters} onFilterChange={(p) => setFilters((f) => ({ ...f, ...p }))} onOpenTask={openTask} onToggleStatus={cycleStatus} />
            )}
            {view === 'calendar' && (
              <CalendarView
                projects={projects}
                tasks={tasks}
                cal={cal}
                calSel={calSel}
                accent={accent}
                onPrevMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
                onSelectDay={setCalSel}
                onOpenTask={openTask}
                onToggleStatus={cycleStatus}
              />
            )}
          </div>
        </main>
      </div>

      {modal === 'task' && form && (
        <TaskModal
          form={form}
          projects={projects}
          onChange={setFormPatch}
          onSave={saveTask}
          onCancel={closeModal}
          onDelete={deleteTask}
          onAddSub={addSub}
          onToggleSub={toggleSub}
          onRemoveSub={removeSub}
          onAddMedia={addMedia}
          onRemoveMedia={removeMedia}
          onImage={onImage}
        />
      )}
      {modal === 'project' && form && (
        <ProjectModal
          form={form}
          onChange={setFormPatch}
          onSave={saveProject}
          onCancel={closeModal}
          onDelete={deleteProject}
        />
      )}
    </div>
  );
}
