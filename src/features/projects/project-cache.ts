import { apiRequest } from '@/lib/api';
import { getDatabase } from '@/lib/database';

export type Project = {
  public_id: string;
  name: string;
  address: string | null;
  status: string | null;
  updated_at: string | null;
};

type ProjectPage = { data: Project[]; next_cursor: string | null };

/** The saved list, available with no signal. */
export async function cachedProjects(): Promise<Project[]> {
  const db = await getDatabase();

  return db.getAllAsync<Project>(
    'SELECT public_id, name, address, status, updated_at FROM projects ORDER BY position',
  );
}

export async function cachedProject(publicId: string): Promise<Project | null> {
  const db = await getDatabase();

  return db.getFirstAsync<Project>(
    'SELECT public_id, name, address, status, updated_at FROM projects WHERE public_id = ?',
    publicId,
  );
}

/** Download every active project and replace the saved list in one transaction. */
export async function refreshProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  let cursor: string | null = null;

  do {
    const query: string = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    const page: ProjectPage = await apiRequest<ProjectPage>(`/projects${query}`);
    projects.push(...page.data);
    cursor = page.next_cursor;
  } while (cursor);

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM projects');
    for (const [position, project] of projects.entries()) {
      await db.runAsync(
        'INSERT INTO projects (public_id, name, address, status, updated_at, position) VALUES (?, ?, ?, ?, ?, ?)',
        project.public_id,
        project.name,
        project.address ?? null,
        project.status ?? null,
        project.updated_at ?? null,
        position,
      );
    }
    await db.runAsync(
      'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      'projects_refreshed_at',
      new Date().toISOString(),
    );
  });

  return projects;
}

export async function projectsRefreshedAt(): Promise<Date | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    'projects_refreshed_at',
  );

  return row ? new Date(row.value) : null;
}
