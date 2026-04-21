'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from 'react';
import Fuse from 'fuse.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Status = 'notFixed' | 'in-progress' | 'fixed';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Customer {
  id: number;
  name: string;
  priority: Priority;
  status: Status;
  bugId: string;
  createdAt: number;
  description: string;
  url: string;
  expectedResult: string;
  actualResult: string;
  note: string;
  attachmentUrl?: string;
}

interface QueueContextType {
  queue: Record<string, Customer[]>;
  addQueue: (
    projectId: string,
    customer: Omit<Customer, 'id' | 'status' | 'createdAt' | 'bugId'>,
  ) => Promise<number>;
  removeQueue: (projectId: string, id: number) => Promise<void>;
  updateQueue: (projectId: string, id: number, status: Status) => Promise<void>;
  updatePriorityQueue: (
    projectId: string,
    id: number,
    newPriority: Priority,
  ) => Promise<void>;
  fetchBugs: (projectId: string) => Promise<void>;
  fetchQueue: () => void;
  clearQueue: () => void;
}

// ─── SSR-safe token helper ────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function uploadAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Context ──────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Record<string, Customer[]>>({});

  const fetchBugs = useCallback(async (projectId: string): Promise<void> => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data: Customer[] = await res.json();
        setQueue((prev) => ({ ...prev, [projectId]: data }));
      }
    } catch (err) {
      console.error('Failed to fetch bugs:', err);
    }
  }, []);

  // fetchQueue is a no-op stub kept for ProjectContext compatibility.
  // Callers that need fresh data should call fetchBugs(projectId) directly.
  const fetchQueue = useCallback((): void => {
    // intentional no-op — queue is fetched per-project via fetchBugs
  }, []);

  const addQueue = async (
    projectId: string,
    customer: Omit<Customer, 'id' | 'status' | 'createdAt' | 'bugId'>,
  ): Promise<number> => {
    const projectQueue = queue[projectId] ?? [];

    const fuse = new Fuse(projectQueue, {
      keys: ['expectedResult', 'actualResult', 'description'],
      threshold: 0.4,
    });

    const results = fuse.search(
      `${customer.expectedResult} ${customer.actualResult} ${customer.description}`,
    );

    if (results.length > 0) {
      alert(`Possible duplicate bug: ${results[0].item.bugId}`);
      return 0;
    }

    try {
      const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(customer),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to create bug:', res.status, text);
        return 0;
      }

      const newBug: Customer = await res.json();
      setQueue((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] ?? []), newBug],
      }));

      return newBug.id;
    } catch (err) {
      console.error('addQueue error:', err);
      return 0;
    }
  };

  const removeQueue = async (projectId: string, id: number): Promise<void> => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (res.ok) {
      setQueue((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] ?? []).filter((b) => b.id !== id),
      }));
    }
  };

  const updateQueue = async (
    projectId: string,
    id: number,
    status: Status,
  ): Promise<void> => {
    const res = await fetch(
      `${API}/api/projects/${projectId}/bugs/${id}/status`,
      {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      },
    );

    if (res.ok) {
      setQueue((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] ?? []).map((b) =>
          b.id === id ? { ...b, status } : b,
        ),
      }));
    }
  };

  const updatePriorityQueue = async (
    projectId: string,
    id: number,
    newPriority: Priority,
  ): Promise<void> => {
    const res = await fetch(
      `${API}/api/projects/${projectId}/bugs/${id}/priority`,
      {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ priority: newPriority }),
      },
    );

    if (res.ok) {
      setQueue((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] ?? []).map((b) =>
          b.id === id ? { ...b, priority: newPriority } : b,
        ),
      }));
    }
  };

  const clearQueue = (): void => {
    setQueue({});
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        addQueue,
        removeQueue,
        updateQueue,
        updatePriorityQueue,
        fetchBugs,
        fetchQueue,
        clearQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueueContext = (): QueueContextType => {
  const context = useContext(QueueContext);
  if (!context)
    throw new Error('useQueueContext must be used within QueueProvider');
  return context;
};