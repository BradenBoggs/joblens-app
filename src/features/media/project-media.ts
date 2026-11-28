import { apiRequest } from '@/lib/api';

/** One photo or video as `GET /api/v1/projects/{project}/media` returns it. */
export type MediaItem = {
  public_id: string;
  kind: 'image' | 'video';
  filename: string;
  taken_at: string | null;
  uploader_name: string | null;
  /** Private addresses that stop working after a short while; refresh the list to renew them. */
  thumbnail_url: string | null;
  preview_url: string | null;
};

export type MediaPage = { data: MediaItem[]; next_page: number | null };

export function downloadMediaPage(projectId: string, page = 1): Promise<MediaPage> {
  return apiRequest<MediaPage>(`/projects/${encodeURIComponent(projectId)}/media?page=${page}`);
}

/** The newest page, the one kept on the phone for offline use. */
export function downloadNewestMedia(projectId: string): Promise<MediaPage> {
  return downloadMediaPage(projectId);
}
