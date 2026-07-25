import { PAL, uid, offset } from './helpers';

// First-run sample data so the app isn't empty on first launch.
export function seed() {
  const projects = [
    { id: 'p1', name: 'OneHub', color: PAL[2] },
    { id: 'p2', name: 'OneHub Revamp', color: PAL[0] },
    { id: 'p3', name: 'ServiceHub', color: PAL[1] },
    { id: 'p4', name: 'Personal', color: PAL[3] },
  ];

  const T = (o) => Object.assign({ id: uid(), tags: [], subtasks: [], media: [], type: 'task', createdAt: Date.now() }, o);

  const tasks = [
    T({ projectId: 'p1', title: 'Fix login redirect loop', priority: 'high', status: 'doing', due: offset(-1, 17, 0), tags: ['bug'], subtasks: [{ id: 's1', text: 'Reproduce on staging', done: true }, { id: 's2', text: 'Patch auth guard', done: false }, { id: 's3', text: 'Add regression test', done: false }] }),
    T({ projectId: 'p1', title: 'QA regression pass', priority: 'med', status: 'todo', due: offset(2, 15, 0), reminder: offset(2, 14, 0) }),
    T({ projectId: 'p1', title: 'Weekly team sync', type: 'meeting', priority: 'low', status: 'todo', due: offset(1, 10, 0), reminder: offset(1, 9, 45) }),
    T({ projectId: 'p2', title: 'New dashboard wireframes', priority: 'high', status: 'doing', due: offset(0, 16, 0), tags: ['design'], media: [{ id: 'm1', type: 'image', name: 'dashboard-v2.png' }, { id: 'm2', type: 'link', name: 'Figma board', url: '#' }], subtasks: [{ id: 's4', text: 'Sketch layout', done: true }, { id: 's5', text: 'High-fi mockup', done: false }] }),
    T({ projectId: 'p2', title: 'Design review', type: 'meeting', priority: 'med', status: 'todo', due: offset(0, 14, 0), reminder: offset(0, 13, 45) }),
    T({ projectId: 'p2', title: 'Migrate to design tokens', priority: 'med', status: 'todo', due: offset(5, 12, 0) }),
    T({ projectId: 'p2', title: 'User research synthesis', priority: 'low', status: 'done', due: offset(-3, 12, 0), media: [{ id: 'm3', type: 'doc', name: 'research.pdf' }] }),
    T({ projectId: 'p3', title: 'Ticket triage automation spec', priority: 'high', status: 'todo', due: offset(3, 11, 0), tags: ['spec'] }),
    T({ projectId: 'p3', title: 'API rate limiting', priority: 'med', status: 'doing', due: offset(4, 17, 0) }),
    T({ projectId: 'p3', title: 'Onboarding docs', priority: 'low', status: 'todo', due: offset(9, 12, 0), media: [{ id: 'm4', type: 'link', name: 'Notion doc', url: '#' }] }),
    T({ projectId: 'p3', title: 'Incident postmortem', priority: 'med', status: 'done', due: offset(-2, 15, 0) }),
    T({ projectId: 'p4', title: 'Renew passport', priority: 'high', status: 'todo', due: offset(6, 9, 0), reminder: offset(5, 9, 0) }),
    T({ projectId: 'p4', title: 'Dentist appointment', type: 'meeting', priority: 'med', status: 'todo', due: offset(1, 8, 30), reminder: offset(1, 7, 30) }),
    T({ projectId: 'p4', title: 'Book flights for offsite', priority: 'med', status: 'todo', due: offset(0, 20, 0) }),
    T({ projectId: 'p4', title: 'Read "Design Systems"', priority: 'low', status: 'todo', due: '' }),
  ];

  return { projects, tasks, settings: { accent: '#4a7862', hideCompleted: false }, v: 1 };
}
