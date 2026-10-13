'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

/** A fix the assignee submitted with a photo, waiting for the project owner's decision. */
export interface PendingReview {
  id: number;
  bugId: string;
  projectId: number;
  projectName: string;
  priority: string;
  description: string;
  actualResult: string;
  expectedResult: string;
  url: string;
  attachmentUrl?: string | null;
  resolutionEvidenceUrl?: string | null;
  submittedForReviewAt?: number | null;
  assignedToEmail?: string | null;
  testCaseTitle?: string | null;
}

/** Fired after an approve/reject so every listener (header badge, page) refreshes. */
export const REVIEWS_CHANGED = 'reviews-changed';

/** Polls the fixes waiting for the signed-in owner's approval. */
export function usePendingReviews(pollMs = 30000) {
  const { token } = useAuthContext();
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) {
      setReviews([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bugs/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReviews(await res.json());
    } catch (err) {
      console.error('Fetch pending reviews failed:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), pollMs);
    const onChanged = () => void refresh();
    window.addEventListener(REVIEWS_CHANGED, onChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener(REVIEWS_CHANGED, onChanged);
    };
  }, [refresh, pollMs]);

  return { reviews, loading, refresh };
}
