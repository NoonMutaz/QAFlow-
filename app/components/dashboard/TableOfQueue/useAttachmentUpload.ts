import { useCallback, useState } from "react";
import { uploadBugAttachment } from "./api";
import type { UpdateBugInState } from "./types";

/** Tracks which bug rows are currently uploading evidence. */
export function useAttachmentUpload(projectId: string | number, updateBugInState?: UpdateBugInState) {
  const [uploadingIds, setUploadingIds] = useState<Record<number, boolean>>({});

  const upload = useCallback(
    async (file: File, bugId: number) => {
      setUploadingIds((prev) => ({ ...prev, [bugId]: true }));
      const attachmentUrl = await uploadBugAttachment(projectId, bugId, file);
      if (attachmentUrl) updateBugInState?.(projectId, bugId, { attachmentUrl });
      setUploadingIds((prev) => ({ ...prev, [bugId]: false }));
    },
    [projectId, updateBugInState]
  );

  return { uploadingIds, upload };
}
