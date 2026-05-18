import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';

interface Member {
  id: string;
  userId: string;
  email: string;
  role: 'owner' | 'member' | 'viewer';
  joinedAt: string;
}

function authHeaders(contentType = false): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useProjectMembers(inviteModal: number | null) {
  const { user } = useAuthContext();
  const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const fetchProjectMembers = useCallback(async (projectId: number) => {
    if (!projectId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/members`,
        { headers: authHeaders() }
      );
      if (res.ok) setProjectMembers(await res.json());
    } catch (e) {
      console.error('Network error fetching members:', e);
    }
  }, []);

  useEffect(() => {
    if (inviteModal !== null) void fetchProjectMembers(inviteModal);
    else setProjectMembers([]);
  }, [inviteModal, fetchProjectMembers]);

  const handleUpdateRole = async (userId: string, role: Member['role']) => {
    if (!inviteModal || !user) return;
    if (String(userId) === String(user.id)) {
      alert('⚠️ You cannot change your own role');
      return;
    }
    setUpdatingMemberId(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${userId}`,
        { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ role }) }
      );
      if (!res.ok) { alert(`❌ Update failed: ${await res.text()}`); return; }
      await fetchProjectMembers(inviteModal);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!inviteModal) return;
    setRemovingMemberId(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${inviteModal}/members/${userId}`,
        { method: 'DELETE', headers: authHeaders() }
      );
      if (!res.ok) throw new Error(await res.text());
      setProjectMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (error: unknown) {
      alert(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRemovingMemberId(null);
    }
  };

  return {
    projectMembers,
    removingMemberId,
    updatingMemberId,
    setRemovingMemberId,
    setUpdatingMemberId,
    handleUpdateRole,
    handleRemoveMember,
  };
}