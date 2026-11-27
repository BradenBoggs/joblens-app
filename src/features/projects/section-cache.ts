import { getDatabase } from '@/lib/database';

export type SavedSection<T> = { data: T; refreshedAt: Date };

/** What one section of a project (its media, its checklists) last downloaded, for use offline. */
export async function cachedSection<T>(
  projectId: string,
  section: string,
): Promise<SavedSection<T> | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ data: string; refreshed_at: string }>(
    'SELECT data, refreshed_at FROM project_sections WHERE public_id = ? AND section = ?',
    projectId,
    section,
  );

  return row ? { data: JSON.parse(row.data) as T, refreshedAt: new Date(row.refreshed_at) } : null;
}

export async function saveSection(
  projectId: string,
  section: string,
  data: unknown,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO project_sections (public_id, section, data, refreshed_at) VALUES (?, ?, ?, ?)',
    projectId,
    section,
    JSON.stringify(data),
    new Date().toISOString(),
  );
}
