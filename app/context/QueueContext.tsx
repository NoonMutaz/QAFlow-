'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Fuse from 'fuse.js';

//  TYPES AND INTERFACES
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

export interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string;
  createdAt: string;
  user : {
    name: string;
    email: string;
  };
}

interface QueueContextType {
  queue: Record<string, Customer[]>;
  projectMembers: any[];
  myAssignedBugs: Customer[];
  loadingMyBugs: boolean;
  activityLogs: ActivityLog[];
  loadingLogs: boolean;
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
  fetchActivityLogs: (projectId: string) => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  //  STATE HOOKS LAYER 
  const [queue, setQueue] = useState<Record<string, Customer[]>>({});
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [myAssignedBugs, setMyAssignedBugs] = useState<Customer[]>([]);
  const [loadingMyBugs, setLoadingMyBugs] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Cookie Utility to extract auth token directly from document cookies
  const getCookieToken = () => {
    if (typeof document === 'undefined') return null; // SSR safety check
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  };

  // Main authorization header builder using the cookie 
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getCookieToken()}`,
  });

  //  CORE FETCHERS 
  const fetchBugs = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
        headers: authHeaders(),
        
      });
      if (!res.ok) throw new Error('Failed to fetch project bugs');
      const data = await res.json();
      setQueue((prev) => ({ ...prev, [projectId]: data }));
    } catch (err) {
      console.error('Fetch failed', err);
    }
  }, []);

  const fetchMyAssignedBugs = useCallback(async () => {
    setLoadingMyBugs(true);
    try {
      const res = await fetch(`${API}/api/bugs/me`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMyAssignedBugs(data);
      }
    } catch (err) {
      console.error("Error fetching my assigned bugs:", err);
    } finally {
      setLoadingMyBugs(false);
    }
  }, []);

  const fetchActivityLogs = useCallback(async (projectId: string) => {
    setLoadingLogs(true);
    try {
      const response = await fetch(
        `${API}/api/projects/${projectId}/activity`,
        {
          headers: authHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data); 
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoadingLogs(false); 
    }
  }, []);

  //   FUSE LOGIC DUPLICATIONS SCANNER  
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

  //   QUEUE OPERATIONS  
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
      
      //    State فوراً بالـ newBug الذي يحتوي على الـ AssignedByName الجديد القادم من الباكيند
      setQueue((prev) => ({ 
        ...prev, 
        [projectId]: [...(prev[projectId] ?? []), newBug] 
      }));

      // تحديث قائمة   Bugs الخاصة بالمستخدم مباشرة بعد الإضافة
      fetchMyAssignedBugs();
      
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

  const fetchProjectMembers = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/members`, {
        headers: authHeaders(),
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
      const res = await fetch(`${API}/api/projects/${projectId}/bugs/${bugId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ 
          field: "assignedtouserid", 
          value: userId ? userId.toString() : "" 
        }),
      });
      
      if (res.ok) {
        const updatedBugData = await res.json();
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
      activityLogs,
      loadingLogs,
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
      fetchMyAssignedBugs,
      fetchActivityLogs
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