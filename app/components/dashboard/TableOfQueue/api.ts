const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => document.cookie.match(/(^| )token=([^;]+)/)?.[2];

/** Full URL of an uploaded file returned by the API as a relative path. */
export const mediaUrl = (path?: string) => `${API_URL}${path ?? ""}`;

/**
 * Updates a single field of a bug through the generic PATCH endpoint.
 * Returns true when the server accepted the change.
 */
export async function patchBugField(
  projectId: string | number,
  bugId: number,
  field: string,
  value: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/bugs/${bugId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ field: field.toLowerCase(), value }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Uploads an evidence file and returns its attachment URL, or null on failure. */
export async function uploadBugAttachment(
  projectId: string | number,
  bugId: number,
  file: File
): Promise<string | null> {
  const body = new FormData();
  body.append("file", file);
  try {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/bugs/${bugId}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.attachmentUrl ?? null;
  } catch (error) {
    console.error("Upload failed", error);
    return null;
  }
}
