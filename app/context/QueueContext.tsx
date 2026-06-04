'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Fuse from 'fuse.js';

// ─── TYPES ───────────────────────────────────────────────────────────────────
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
  // Added assignment tracking fields to clear up typescript errors
  
  assignedToUserId?: number | null;
  assignedToEmail?: string | null;
  assignedById?: number | null;
  assignedByName?: string | null;
  assignedAt?: number | null; 
  projectId: number;
}

export interface DuplicateMatch {
  item: Customer;
  matchedKey: string;
}

interface QueueContextType {
  queue: Record<string, Customer[]>;
  projectMembers: any[];
  myAssignedBugs: Customer[];
  loadingMyBugs: boolean;
  addQueue: (projectId: string, customer: any) => Promise<number>;
  removeQueue: (projectId: string, id: number) => Promise<void>;
  updateQueue: (projectId: string, id: number, status: Status) => Promise<void>;
  updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => Promise<void>;
  updateBugInState: (projectId: string, bugId: number, updates: Partial<Customer>) => void;
  fetchBugs: (projectId: string) => Promise<void>;
  clearQueue: () => void;
  findDuplicates: (bugs: Customer[], text: string, activeField?: string) => DuplicateMatch | null;
  fetchProjectMembers: (projectId: string) => Promise<void>;
  assignBug: (projectId: string, bugId: number, userId: number | null) => Promise<void>;
  fetchMyAssignedBugs: () => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  // ─── STATE HOOKS LAYER ─────────────────────────────────────────────────────
  const [queue, setQueue] = useState<Record<string, Customer[]>>({});
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [myAssignedBugs, setMyAssignedBugs] = useState<Customer[]>([]);
  const [loadingMyBugs, setLoadingMyBugs] = useState<boolean>(false);

  // Fallback headers parser configuration helper
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  // Helper function to extract cookies cleanly if fallback tracking is required
  const getCookieToken = () => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  };

  // ─── CORE BUGS FETCHERS ─────────────────────────────────────────────────────
  const fetchBugs = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error('Failed to fetch project bugs');
      const data = await res.json();

      setQueue((prev) => ({
        ...prev,
        [projectId]: data,
      }));
    } catch (err) {
      console.error('Fetch failed', err);
    }
  }, []);

const fetchMyAssignedBugs = useCallback(async () => {
    setLoadingMyBugs(true);
    try {
      // Clean target route match pointing to the overridden absolute API path
      const res = await fetch(`${API}/api/bugs/me`, {
        headers: authHeaders(), // Uses localStorage identically to fetchBugs!
      });
      
      if (res.ok) {
        const data = await res.json();
        setMyAssignedBugs(data);
      } else {
        console.error("Server responded with error status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching my assigned bugs:", err);
    } finally {
      setLoadingMyBugs(false);
    }
  }, []);

  // ─── FUSE LOGIC DUPLICATIONS SCANNER ────────────────────────────────────────
  const findDuplicates = useCallback((bugs: Customer[], text: string, activeField?: string): DuplicateMatch | null => {
    if (!text || text.trim().length < 3 || !bugs.length) return null;

    let searchKeys: any[] = [];
    if (activeField === "bugId") {
      searchKeys = [{ name: "bugId", weight: 2 }];
    } else if (activeField === "description" || activeField === "actualResult") {
      searchKeys = [{ name: activeField, weight: 1 }];
    } else {
      searchKeys = [
        { name: "description", weight: 1 },
        { name: "actualResult", weight: 1 }
      ];
    }

    const fuse = new Fuse(bugs, {
      keys: searchKeys,
      includeMatches: true,
      threshold: activeField === "bugId" ? 0.2 : 0.4, 
      ignoreLocation: true,
      minMatchCharLength: 3,
    });

    const results = fuse.search(text);
    if (results.length === 0) return null;

    const bestMatch = results[0];
    
    const matchedKey =
      bestMatch.matches?.find((m) => m.key === activeField)?.key ??
      bestMatch.matches?.[0]?.key ??
      activeField ??
      "description";

    return { item: bestMatch.item, matchedKey };
  }, []);

  //   QUEUE STATE STATE MANAGERS  
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

  // ─── COMMUNITY MEMBER MANAGEMENT AND WORK ITEM ASSIGNMENT ─────────────────
  const fetchProjectMembers = useCallback(async (projectId: string) => {
    try {
      const token = getCookieToken() || localStorage.getItem('token');
      const res = await fetch(`${API}/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjectMembers(data);
      }
    } catch (err) {
      console.error("Failed fetching project members", err);
    }
  }, []);

  const assignBug = useCallback(async (projectId: string, bugId: number, userId: number | null) => {
    try {
      const token = getCookieToken() || localStorage.getItem('token');
      const res = await fetch(`${API}/api/projects/${projectId}/bugs/${bugId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          field: "assignedtouserid", 
          value: userId ? userId.toString() : "" 
        }),
      });
      
      if (res.ok) {
        const updatedBugData = await res.json();
        
        // Correctly call the fetch function now that it sits properly in parent scope
        fetchMyAssignedBugs(); 
        
   updateBugInState(projectId, bugId, { 
  assignedToUserId: userId,
  assignedToEmail: updatedBugData.assignedToEmail,
  assignedById: updatedBugData.assignedById,
  assignedByName: updatedBugData.assignedByName,
  assignedAt: updatedBugData.assignedAt
});
      }
    } catch (err) {
      console.error("Failed to assign bug", err);
    }
  }, [updateBugInState, fetchMyAssignedBugs]);

  return (
    <QueueContext.Provider value={{ 
      queue, 
      projectMembers,
      myAssignedBugs,
      loadingMyBugs,
      addQueue, 
      removeQueue, 
      updateQueue, 
      updatePriorityQueue, 
      updateBugInState, 
      fetchBugs, 
      findDuplicates, 
      clearQueue: () => setQueue({}),
      fetchProjectMembers,
      assignBug,
      fetchMyAssignedBugs
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