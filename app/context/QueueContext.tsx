'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Fuse from 'fuse.js';

// --- Types ---
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

export interface DuplicateMatch {
  item: Customer;
  matchedKey: string;
}

interface QueueContextType {
  queue: Record<string, Customer[]>;
  addQueue: (projectId: string, customer: any) => Promise<number>;
  removeQueue: (projectId: string, id: number) => Promise<void>;
  updateQueue: (projectId: string, id: number, status: Status) => Promise<void>;
  updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => Promise<void>;
  updateBugInState: (projectId: string, bugId: number, updates: Partial<Customer>) => void;
  fetchBugs: (projectId: string) => Promise<void>;
  clearQueue: () => void;
  findDuplicates: (bugs: Customer[], text: string, activeField?: string) => DuplicateMatch | null;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);
const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const getToken = () => {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

// const authHeaders = () => ({
//   'Content-Type': 'application/json',
//   Authorization: `Bearer ${getToken()}`,
// });
export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Record<string, Customer[]>>({});

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

// const fetchBugs = useCallback(async (projectId: string) => {
//   try {
//     const res = await fetch(`${API}/api/projects/${projectId}/bugs`, { headers: authHeaders() });
//     if (res.ok) {
//       const data = await res.json();
//       setQueue((prev) => ({ ...prev, [projectId]: data }));
//     }
//   } catch (err) { console.error("Fetch failed", err); }
// }, []);





const fetchBugs = useCallback(async (projectId: string) => {
  try {
    const res = await fetch(
      `${API}/api/projects/${projectId}/bugs`,
      {
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await res.json();

    setQueue((prev) => ({
      ...prev,
      [projectId]: data,
    }));

  } catch (err) {
    console.error('Fetch failed', err);
  }
}, []);




  //  FUSE LOGIC  
const findDuplicates = useCallback((bugs: Customer[], text: string, activeField?: string): DuplicateMatch | null => {
  if (!text || text.trim().length < 3 || !bugs.length) return null;

  // 1. Dynamic Keys Configuration based on the active field being typed into
let searchKeys: any[] = [];
  if (activeField === "bugId") {
    // Strict exact/close matching for specific IDs
    searchKeys = [{ name: "bugId", weight: 2 }];
  } else if (activeField === "description" || activeField === "actualResult") {
    // Context matching for rich text fields
    searchKeys = [{ name: activeField, weight: 1 }];
  } else {
    // Fallback: If no specific field is targeted, use global contextual fields
    searchKeys = [
      { name: "description", weight: 1 },
      { name: "actualResult", weight: 1 }
    ];
  }

  const fuse = new Fuse(bugs, {
    keys: searchKeys,
    includeMatches: true,
    // 0.4 is perfect for paragraphs. For exact IDs, lower it to 0.2
    threshold: activeField === "bugId" ? 0.2 : 0.4, 
    ignoreLocation: true,
    minMatchCharLength: 3, // Raised to 3 to prevent single/double character noise triggers
  });

  const results = fuse.search(text);
  if (results.length === 0) return null;

  const bestMatch = results[0];
  
  // 2. Identify exactly which property triggered the best match score
  const matchedKey =
    bestMatch.matches?.find((m) => m.key === activeField)?.key ??
    bestMatch.matches?.[0]?.key ??
    activeField ??
    "description";

  return { item: bestMatch.item, matchedKey };
}, []);

  const updateBugInState = useCallback((projectId: string, bugId: number, updates: Partial<Customer>) => {
    setQueue((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] ?? []).map((b) => b.id === bugId ? { ...b, ...updates } : b),
    }));
  }, []);

  const addQueue = async (projectId: string, customer: any) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(customer),
    });
    if (res.ok) {
      const newBug = await res.json();
      setQueue((prev) => ({ ...prev, [projectId]: [...(prev[projectId] ?? []), newBug] }));
      return newBug.id;
    }
    return 0;
  };

  const removeQueue = async (projectId: string, id: number) => {
    if ((await fetch(`${API}/api/projects/${projectId}/bugs/${id}`, { method: 'DELETE', headers: authHeaders() })).ok) {
      setQueue((prev) => ({ ...prev, [projectId]: (prev[projectId] ?? []).filter((b) => b.id !== id) }));
    }
  };

  const updateQueue = async (projectId: string, id: number, status: Status) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) updateBugInState(projectId, id, { status });
  };

  const updatePriorityQueue = async (projectId: string, id: number, priority: Priority) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs/${id}/priority`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ priority }),
    });
    if (res.ok) updateBugInState(projectId, id, { priority });
  };

  return (
    <QueueContext.Provider value={{ 
      queue, addQueue, removeQueue, updateQueue, 
      updatePriorityQueue, updateBugInState, fetchBugs, 
      findDuplicates, 
      clearQueue: () => setQueue({}) 
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueueContext = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueueContext must be used within QueueProvider');
  return context;
};