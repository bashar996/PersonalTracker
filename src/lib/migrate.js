import { PAL, migratePriority } from './helpers';
import { seedWork, DEFAULT_SETTINGS } from './seed';

// Upgrades whatever was previously saved to disk into the current (v2, workspace-based)
// store shape. Returns null if there's nothing to migrate (caller should seed fresh).
export function migrateStore(raw) {
  if (!raw) return null;

  // Already v2 — just backfill any settings/fields added since it was saved.
  if (raw.workspaces && raw.data) {
    const activeWorkspaceId = raw.workspaces.some((w) => w.id === raw.activeWorkspaceId)
      ? raw.activeWorkspaceId
      : raw.workspaces[0].id;
    return {
      workspaces: raw.workspaces,
      activeWorkspaceId,
      data: raw.data,
      settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
      darkMode: !!raw.darkMode,
      v: 2,
    };
  }

  // v1 — a single {projects, tasks, settings} blob becomes the "Personal" workspace,
  // with a seeded "Work" workspace added alongside it.
  if (raw.projects) {
    const oldSettings = raw.settings || {};
    const tasks = (raw.tasks || []).map((t) => ({ ...t, priority: migratePriority(t.priority) }));
    const personal = { projects: raw.projects, tasks, notes: {}, v: 1 };
    return {
      workspaces: [
        { id: 'w1', name: 'Personal', color: PAL[3] },
        { id: 'w2', name: 'Work', color: PAL[1] },
      ],
      activeWorkspaceId: 'w1',
      data: { w1: personal, w2: seedWork() },
      settings: {
        ...DEFAULT_SETTINGS,
        accent: oldSettings.accent || DEFAULT_SETTINGS.accent,
        hideCompleted: !!oldSettings.hideCompleted,
      },
      darkMode: false,
      v: 2,
    };
  }

  return null;
}
