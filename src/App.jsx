import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import ProjectModal from './components/ProjectModal';
import WorkspaceModal from './components/WorkspaceModal';
import CelebrationToast from './components/CelebrationToast';
import TodayView from './components/views/TodayView';
import BoardView from './components/views/BoardView';
import ProjectsView from './components/views/ProjectsView';
import ProjectDetailView from './components/views/ProjectDetailView';
import AllTasksView from './components/views/AllTasksView';
import CalendarView from './components/views/CalendarView';
import SettingsView from './components/views/SettingsView';
import { seedStore } from './lib/seed';
import { migrateStore } from './lib/migrate';
import {
  uid, darken, rgba, ymd, dueInfo, projectById, filterTasks, themeVars,
  fmtTime, fmtDate, fmtTimer, MONTH_NAMES, WEEKDAY_NAMES, PAL,
} from './lib/helpers';

const DEFAULT_FILTERS = { search: '', status: 'all', priority: 'all', projectId: 'all' };

export default function App() {
  const [store, setStoreState] = useState(null);
  const [view, setView] = useState('board');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [cal, setCal] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [calSel, setCalSel] = useState(() => ymd(new Date()));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [notesEditing, setNotesEditing] = useState({});
  const [focusIndex, setFocusIndex] = useState(0);
  const [timer, setTimer] = useState({ taskId: null, seconds: 0, running: false });
  const [celebrating, setCelebrating] = useState(false);

  const timerIntervalRef = useRef(null);
  const celebrateTimerRef = useRef(null);

  // ---------- load / persist ----------
  useEffect(() => {
    let cancelled = false;
    window.api.loadData().then((raw) => {
      if (cancelled) return;
      const migrated = migrateStore(raw) || seedStore();
      setStoreState(migrated);
      window.api.saveData(migrated);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => {
    clearInterval(timerIntervalRef.current);
    clearTimeout(celebrateTimerRef.current);
  }, []);

  // Keep <body>'s own background in sync too, so macOS's rubber-band scroll
  // bounce doesn't flash the light theme underneath a dark-mode window.
  useEffect(() => {
    if (!store) return;
    document.body.style.background = themeVars(store.darkMode)['--ptt-page'];
  }, [store && store.darkMode]);

  function persist(update) {
    setStoreState((prev) => {
      const newStore = typeof update === 'function' ? update(prev) : update;
      if (newStore !== prev) window.api.saveData(newStore);
      return newStore;
    });
  }

  // ---------- notification click -> open task (any workspace) ----------
  useEffect(() => {
    const off = window.api.onNotificationClick((taskId) => openTask(taskId));
    return off;
  });

  // ---------- reminder polling (scans every workspace, not just the active one) ----------
  useEffect(() => {
    function checkReminders() {
      if (!store) return;
      // Computed against the latest state at flush time (not this closure's `store`),
      // so a poll firing the same instant as a user edit can't clobber it.
      persist((prev) => {
        const now = Date.now();
        let changed = false;
        const newData = {};
        Object.keys(prev.data).forEach((wsId) => {
          const wd = prev.data[wsId];
          const tasks = (wd.tasks || []).map((t) => {
            if (!t.reminder || t.status === 'done' || t.reminderFired) return t;
            const rt = new Date(t.reminder).getTime();
            if (rt > now) return t;
            changed = true;
            if (now - rt <= 24 * 3600000) {
              window.api.notify({ id: t.id, title: t.title, body: t.notes ? t.notes.slice(0, 120) : 'Reminder due' });
            }
            return { ...t, reminderFired: true };
          });
          newData[wsId] = { ...wd, tasks };
        });
        return changed ? { ...prev, data: newData } : prev;
      });
    }
    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  if (!store) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#a09a8c', font: "400 14px 'Instrument Sans'" }}>Loading…</div>;
  }

  const { workspaces, activeWorkspaceId, settings, darkMode } = store;
  const data = store.data[activeWorkspaceId] || { projects: [], tasks: [], notes: {} };
  const accent = settings.accent;
  const hideCompleted = !!settings.hideCompleted;
  const projects = data.projects;
  const tasks = data.tasks;
  const now = new Date();

  function persistData(newData) {
    persist({ ...store, data: { ...store.data, [activeWorkspaceId]: newData } });
  }

  // ---------- navigation ----------
  function go(v) { setView(v); setRemindersOpen(false); setNavOpen(false); }
  function openProject(id) { setView('project'); setSelectedProjectId(id); setRemindersOpen(false); setNavOpen(false); }
  function shiftMonth(delta) {
    setCal((c) => { let y = c.y, m = c.m + delta; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } return { y, m }; });
  }
  function toggleCollapse() { setSideCollapsed((s) => !s); }

  // ---------- workspaces ----------
  function toggleWsMenu() { setWsMenuOpen((s) => !s); }
  function switchWorkspace(id) {
    if (id === activeWorkspaceId) { setWsMenuOpen(false); return; }
    persist({ ...store, activeWorkspaceId: id });
    setView('board'); setSelectedProjectId(null); setFilters(DEFAULT_FILTERS); setWsMenuOpen(false); setNavOpen(false);
  }
  function newWorkspace() {
    setForm({ id: null, name: '', color: PAL[workspaces.length % PAL.length] });
    setModal('workspace');
    setWsMenuOpen(false);
  }
  function editWorkspace(id) {
    const w = workspaces.find((x) => x.id === id);
    if (w) setForm({ ...w });
    setModal('workspace');
    setWsMenuOpen(false);
  }
  function saveWorkspace() {
    if (!form.name.trim()) return;
    if (form.id) {
      const newWorkspaces = workspaces.map((w) => (w.id === form.id ? { id: w.id, name: form.name.trim(), color: form.color } : w));
      persist({ ...store, workspaces: newWorkspaces });
    } else {
      const id = uid();
      const newWorkspaces = workspaces.concat([{ id, name: form.name.trim(), color: form.color }]);
      const newData = { ...store.data, [id]: { projects: [], tasks: [], notes: {} } };
      persist({ ...store, workspaces: newWorkspaces, data: newData, activeWorkspaceId: id });
      setView('board'); setSelectedProjectId(null); setFilters(DEFAULT_FILTERS);
    }
    setModal(null); setForm(null);
  }
  function deleteWorkspace() {
    if (!form || !form.id || workspaces.length <= 1) return;
    const newWorkspaces = workspaces.filter((w) => w.id !== form.id);
    const newData = { ...store.data };
    delete newData[form.id];
    const newActive = activeWorkspaceId === form.id ? newWorkspaces[0].id : activeWorkspaceId;
    persist({ ...store, workspaces: newWorkspaces, data: newData, activeWorkspaceId: newActive });
    setModal(null); setForm(null); setView('board'); setSelectedProjectId(null);
  }

  // ---------- task crud ----------
  function toForm(t) { return { ...t, _newSub: '', _tagsText: (t.tags || []).join(', '), _mediaName: '', _mediaUrl: '', _mediaNoteText: '', _mediaType: 'link' }; }
  function openTask(id) {
    if (!store) return;
    let wsId = activeWorkspaceId;
    let t = (store.data[wsId].tasks || []).find((x) => x.id === id);
    if (!t) {
      wsId = Object.keys(store.data).find((k) => (store.data[k].tasks || []).some((x) => x.id === id));
      t = wsId ? store.data[wsId].tasks.find((x) => x.id === id) : null;
    }
    if (!t) return;
    if (wsId !== activeWorkspaceId) {
      persist({ ...store, activeWorkspaceId: wsId });
      setView('board'); setSelectedProjectId(null); setFilters(DEFAULT_FILTERS);
    }
    setForm(toForm(t));
    setModal('task');
    setRemindersOpen(false);
  }
  function newTask(projectId) {
    const first = (data.projects[0] || {}).id;
    setForm(toForm({ id: null, projectId: projectId || first, type: 'task', status: 'todo', priority: 2, title: '', notes: '', due: '', reminder: '', tags: [], subtasks: [], media: [] }));
    setModal('task');
    setRemindersOpen(false);
  }
  function setFormPatch(patch) { setForm((f) => ({ ...f, ...patch })); }
  function cycleStatus(id) {
    const order = ['todo', 'doing', 'done'];
    let becameDone = false;
    const newTasks = data.tasks.map((t) => {
      if (t.id !== id) return t;
      const ns = order[(order.indexOf(t.status) + 1) % 3];
      if (ns === 'done' && t.status !== 'done') becameDone = true;
      return { ...t, status: ns };
    });
    persistData({ ...data, tasks: newTasks });
    if (becameDone && settings.celebration) celebrate();
  }
  function addSub() {
    const t = (form._newSub || '').trim();
    if (!t) return;
    setFormPatch({ subtasks: (form.subtasks || []).concat([{ id: uid(), text: t, done: false }]), _newSub: '' });
  }
  function toggleSub(id) { setFormPatch({ subtasks: form.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) }); }
  function removeSub(id) { setFormPatch({ subtasks: form.subtasks.filter((s) => s.id !== id) }); }
  function addMediaItem(item) {
    setFormPatch({ media: (form.media || []).concat([{ id: uid(), ...item }]) });
  }
  function removeMedia(id) { setFormPatch({ media: form.media.filter((m) => m.id !== id) }); }
  function readFileAsMedia(type) {
    return (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => addMediaItem({ type, name: file.name, url: r.result, mimeType: file.type });
      r.readAsDataURL(file);
      e.target.value = '';
    };
  }
  const onImage = readFileAsMedia('image');
  const onDocFile = readFileAsMedia('doc');
  function addLink() {
    const raw = (form._mediaUrl || '').trim();
    if (!raw) return;
    const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : 'https://' + raw;
    let label = (form._mediaName || '').trim();
    if (!label) {
      try { label = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { label = url; }
    }
    addMediaItem({ type: 'link', name: label, url });
    setFormPatch({ _mediaUrl: '', _mediaName: '' });
  }
  function addNote() {
    const text = (form._mediaNoteText || '').trim();
    if (!text) return;
    const name = (form._mediaName || '').trim() || text.split('\n')[0].slice(0, 40);
    addMediaItem({ type: 'note', name, text });
    setFormPatch({ _mediaNoteText: '', _mediaName: '' });
  }
  function addVoice(dataUrl, durationSec) {
    addMediaItem({ type: 'voice', name: 'Voice note · ' + fmtTimer(durationSec), url: dataUrl, duration: durationSec });
  }
  function openMedia(item) {
    if (item.type === 'link') window.api.openExternal(item.url);
    else if (item.type === 'doc') window.api.openDataFile({ name: item.name, dataUrl: item.url });
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
      priority: f.priority === '' || f.priority == null ? 2 : Number(f.priority),
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
    persistData({ ...data, tasks: newTasks });
    setModal(null);
    setForm(null);
  }
  function deleteTask() {
    if (form && form.id) persistData({ ...data, tasks: data.tasks.filter((t) => t.id !== form.id) });
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
    persistData({ ...data, projects: newProjects });
    setModal(null);
    setForm(null);
    setSelectedProjectId(rec.id);
    setView('project');
  }
  function deleteProject() {
    if (form && form.id) {
      persistData({
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
  function setAccent(color) { persist((prev) => ({ ...prev, settings: { ...prev.settings, accent: color } })); }
  function setHideCompleted(v) { persist((prev) => ({ ...prev, settings: { ...prev.settings, hideCompleted: v } })); }
  function toggleSetting(key) { persist((prev) => ({ ...prev, settings: { ...prev.settings, [key]: !prev.settings[key] } })); }
  function toggleDark() { persist((prev) => ({ ...prev, darkMode: !prev.darkMode })); }

  // ---------- sections / notes ----------
  function toggleSection(key) { setCollapsedSections((s) => ({ ...s, [key]: !s[key] })); }
  function toggleNotesEdit(key) { setNotesEditing((s) => ({ ...s, [key]: !s[key] })); }
  function exitNotesEdit(key, text) { if (text) setNotesEditing((s) => ({ ...s, [key]: false })); }
  function setNote(day, text) {
    const notes = { ...(data.notes || {}), [day]: text };
    persistData({ ...data, notes });
  }
  // Typing saves the text AND pins editing state explicitly true, so the
  // editing flag stops falling back to "!hasContent" the instant a note
  // goes from empty to non-empty — otherwise the textarea would unmount
  // mid-keystroke as soon as the first character landed.
  function noteInput(dayKey, editKey, text) {
    setNote(dayKey, text);
    setNotesEditing((s) => (s[editKey] === true ? s : { ...s, [editKey]: true }));
  }

  // ---------- celebration ----------
  function celebrate() {
    clearTimeout(celebrateTimerRef.current);
    setCelebrating(true);
    celebrateTimerRef.current = setTimeout(() => setCelebrating(false), 1300);
  }

  // ---------- focus mode / timer ----------
  function startTimer(taskId) {
    if (timer.taskId !== taskId) setTimer({ taskId, seconds: 0, running: true });
    else setTimer((t) => ({ ...t, running: true }));
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => setTimer((t) => ({ ...t, seconds: t.seconds + 1 })), 1000);
  }
  function pauseTimer() { clearInterval(timerIntervalRef.current); setTimer((t) => ({ ...t, running: false })); }
  function resetTimer(taskId) { clearInterval(timerIntervalRef.current); setTimer({ taskId, seconds: 0, running: false }); }
  function onTimerToggle(taskId) { (timer.taskId === taskId && timer.running) ? pauseTimer() : startTimer(taskId); }

  // ---------- derived values ----------
  const accentDark = darken(accent, 0.2);
  const accentTint = rgba(accent, 0.12);
  const accentTintStrong = rgba(accent, 0.2);
  const cssVars = {
    '--accent': accent, '--accent-dark': accentDark, '--accent-tint': accentTint, '--accent-tint-strong': accentTintStrong,
    ...themeVars(darkMode),
  };

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
  const bellPulse = !!settings.gentleReminders && reminderBadge > 0;

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
    settings: ['Settings', 'Focus & accessibility features'],
  };
  const [title, subtitle] = titles[view] || ['', ''];

  const calNotesRaw = (data.notes || {})[calSel] || '';
  const calNotesEditing = notesEditing.cal ?? !calNotesRaw;

  let showNudge = false;
  if (modal === 'task' && form) {
    showNudge = !!settings.autoBreakNudge && !!form.id && form.status !== 'done' && (form.subtasks || []).length === 0 && form.createdAt && (Date.now() - form.createdAt) > 3 * 86400000;
  }

  return (
    <div className="pt-shell" style={cssVars}>
      <div className="pt-app">
        {celebrating && <CelebrationToast />}
        <div className={'pt-backdrop' + (navOpen ? ' pt-show' : '')} onClick={() => setNavOpen(false)} />
        <Sidebar
          navOpen={navOpen}
          collapsed={sideCollapsed}
          onToggleCollapse={toggleCollapse}
          view={view}
          selectedProjectId={selectedProjectId}
          projects={projects}
          todayCount={cat.overdue.length + cat.today.length}
          allOpenCount={openTasks.length}
          projectOpenCounts={projectOpenCounts}
          onNavigate={go}
          onOpenProject={openProject}
          onAddProject={newProject}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          wsMenuOpen={wsMenuOpen}
          onToggleWsMenu={toggleWsMenu}
          onSwitchWorkspace={switchWorkspace}
          onEditWorkspace={editWorkspace}
          onNewWorkspace={newWorkspace}
        />
        <main className="pt-main">
          <Header
            title={title}
            subtitle={subtitle}
            onToggleNav={() => setNavOpen((s) => !s)}
            onNewTask={() => newTask()}
            darkMode={darkMode}
            onToggleDark={toggleDark}
            remindersOpen={remindersOpen}
            onToggleReminders={() => setRemindersOpen((s) => !s)}
            reminders={reminders}
            reminderBadge={reminderBadge}
            bellPulse={bellPulse}
            onOpenTask={openTask}
          />
          <div className="pt-content">
            {view === 'today' && (
              <TodayView
                tasks={tasks} projects={projects} accent={accent}
                colorUrgency={!!settings.colorUrgency} reduceClutter={!!settings.reduceClutter}
                onOpenTask={openTask} onToggleStatus={cycleStatus}
                collapsedSections={collapsedSections} onToggleSection={toggleSection}
                focusModeOn={!!settings.focusMode} bodyTimerOn={!!settings.bodyTimer}
                focusIndex={focusIndex} onFocusSkip={() => setFocusIndex((i) => i + 1)} onFocusMarkDone={cycleStatus}
                timerState={timer} onTimerToggle={onTimerToggle} onTimerReset={resetTimer}
                oneThingOn={!!settings.oneThing}
                notes={data.notes} onNoteInput={noteInput} notesEditing={notesEditing}
                onToggleNotesEdit={toggleNotesEdit} onExitNotesEdit={exitNotesEdit}
              />
            )}
            {view === 'board' && (
              <BoardView
                projects={projects} tasks={tasks} hideCompleted={hideCompleted}
                onOpenTask={openTask} onToggleStatus={cycleStatus} onAddTask={newTask}
                accent={accent} colorUrgency={!!settings.colorUrgency} reduceClutter={!!settings.reduceClutter}
                notes={data.notes} onNoteInput={noteInput} notesEditing={notesEditing}
                onToggleNotesEdit={toggleNotesEdit} onExitNotesEdit={exitNotesEdit}
              />
            )}
            {view === 'projects' && (
              <ProjectsView projects={projects} tasks={tasks} onOpenProject={openProject} onAddProject={newProject} />
            )}
            {view === 'project' && pd && (
              <ProjectDetailView
                project={pd.project} tasks={tasks} onOpenTask={openTask} onToggleStatus={cycleStatus}
                onAddTask={newTask} onEditProject={editProject}
                accent={accent} colorUrgency={!!settings.colorUrgency} reduceClutter={!!settings.reduceClutter}
              />
            )}
            {view === 'all' && (
              <AllTasksView
                projects={projects} visibleTasks={visibleTasks} filters={filters}
                onFilterChange={(p) => setFilters((f) => ({ ...f, ...p }))} onOpenTask={openTask} onToggleStatus={cycleStatus}
                accent={accent} colorUrgency={!!settings.colorUrgency} reduceClutter={!!settings.reduceClutter}
              />
            )}
            {view === 'calendar' && (
              <CalendarView
                projects={projects}
                tasks={tasks}
                cal={cal}
                calSel={calSel}
                accent={accent}
                colorUrgency={!!settings.colorUrgency} reduceClutter={!!settings.reduceClutter}
                onPrevMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
                onSelectDay={setCalSel}
                onOpenTask={openTask}
                onToggleStatus={cycleStatus}
                calNotes={calNotesRaw}
                calNotesEditing={calNotesEditing}
                onCalNotesChange={(e) => noteInput(calSel, 'cal', e.target.value)}
                onCalNotesBlur={() => exitNotesEdit('cal', calNotesRaw)}
                onToggleCalNotesEdit={() => toggleNotesEdit('cal')}
              />
            )}
            {view === 'settings' && (
              <SettingsView
                accent={accent} hideCompleted={hideCompleted} settings={settings}
                onSetAccent={setAccent} onSetHideCompleted={setHideCompleted} onToggleSetting={toggleSetting}
              />
            )}
          </div>
        </main>
      </div>

      {modal === 'task' && form && (
        <TaskModal
          form={form}
          projects={projects}
          showNudge={showNudge}
          onChange={setFormPatch}
          onSave={saveTask}
          onCancel={closeModal}
          onDelete={deleteTask}
          onAddSub={addSub}
          onToggleSub={toggleSub}
          onRemoveSub={removeSub}
          onRemoveMedia={removeMedia}
          onImage={onImage}
          onDocFile={onDocFile}
          onAddLink={addLink}
          onAddNote={addNote}
          onAddVoice={addVoice}
          onOpenMedia={openMedia}
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
      {modal === 'workspace' && form && (
        <WorkspaceModal
          form={form}
          canDelete={!!form.id && workspaces.length > 1}
          onChange={setFormPatch}
          onSave={saveWorkspace}
          onCancel={closeModal}
          onDelete={deleteWorkspace}
        />
      )}
    </div>
  );
}
