import { apiRequest } from '@/lib/api';

export type ChecklistItem = {
  public_id: string;
  title: string;
  instructions: string | null;
  photo_required: boolean;
  state: 'open' | 'completed' | 'not_applicable';
  response_note: string | null;
  not_applicable_reason: string | null;
  addressed_by: string | null;
  addressed_at: string | null;
  photo_count: number;
};

/** One checklist as `GET /api/v1/projects/{project}/checklists` returns it. */
export type Checklist = {
  public_id: string;
  name: string;
  description: string | null;
  updated_at: string | null;
  counts: { completed: number; not_applicable: number; open: number };
  items: ChecklistItem[];
};

export async function downloadChecklists(projectId: string): Promise<Checklist[]> {
  const response = await apiRequest<{ data: Checklist[] }>(
    `/projects/${encodeURIComponent(projectId)}/checklists`,
  );

  return response.data;
}
