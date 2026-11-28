import { ApiError, apiRequest } from '@/lib/api';
import { getDatabase } from '@/lib/database';

export type Project = {
  public_id: string;
  name: string;
  address: string | null;
  status: string | null;
  updated_at: string | null;
};

type ProjectPage = { data: Project[]; next_cursor: string | null };

/** One project as `GET /api/v1/projects/{project}` returns it. */
export type ProjectDetails = Project & {
  description: string | null;
  archived_at: string | null;
  customer_contact: {
    name: string | null;
    company_name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  creator: { name: string } | null;
  counts: { media: number; collections: number; checklists: number; requests: number };
};

type ProjectDetailsResponse = {
  data: Omit<ProjectDetails, 'counts'>;
  counts: ProjectDetails['counts'];
};

export type SavedProjectDetails = { project: ProjectDetails; refreshedAt: Date };

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
    // Forget details of projects that left the list (archived, deleted or moved).
    await db.runAsync(
      'DELETE FROM project_details WHERE public_id NOT IN (SELECT public_id FROM projects)',
    );
    await db.runAsync(
      'DELETE FROM project_sections WHERE public_id NOT IN (SELECT public_id FROM projects)',
    );
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

/** The details saved the last time this project was opened with a connection. */
export async function cachedProjectDetails(publicId: string): Promise<SavedProjectDetails | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ data: string; refreshed_at: string }>(
    'SELECT data, refreshed_at FROM project_details WHERE public_id = ?',
    publicId,
  );

  return row
    ? { project: JSON.parse(row.data) as ProjectDetails, refreshedAt: new Date(row.refreshed_at) }
    : null;
}

/**
 * Download one project and save it for offline use. On a 404 its saved details
 * are forgotten and `null` is returned. The row in the project list stays: only
 * a refresh of the list decides which projects exist, because a 404 can also
 * come from a server that does not have this endpoint yet.
 */
export async function refreshProjectDetails(publicId: string): Promise<ProjectDetails | null> {
  const db = await getDatabase();
  let response: ProjectDetailsResponse;

  try {
    response = await apiRequest<ProjectDetailsResponse>(
      `/projects/${encodeURIComponent(publicId)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM project_details WHERE public_id = ?', publicId);
        await db.runAsync('DELETE FROM project_sections WHERE public_id = ?', publicId);
      });

      return null;
    }
    throw error;
  }

  const project: ProjectDetails = { ...response.data, counts: response.counts };
  await db.runAsync(
    'INSERT OR REPLACE INTO project_details (public_id, data, refreshed_at) VALUES (?, ?, ?)',
    publicId,
    JSON.stringify(project),
    new Date().toISOString(),
  );
  // Keep the list row in step with what was just downloaded.
  await db.runAsync(
    'UPDATE projects SET name = ?, address = ?, status = ?, updated_at = ? WHERE public_id = ?',
    project.name,
    project.address ?? null,
    project.status ?? null,
    project.updated_at ?? null,
    publicId,
  );

  return project;
}
