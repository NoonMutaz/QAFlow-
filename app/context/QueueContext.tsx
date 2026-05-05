'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
  addQueue: (projectId: string, customer: any) => Promise<number>;
  removeQueue: (projectId: string, id: number) => Promise<void>;
  updateQueue: (projectId: string, id: number, status: Status) => Promise<void>;
  updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => Promise<void>;
  updateBugInState: (projectId: string, bugId: number, updates: Partial<Customer>) => void;
  fetchBugs: (projectId: string) => Promise<void>;
  clearQueue: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Record<string, Customer[]>>({});

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchBugs = useCallback(async (projectId: string) => {
    if (!projectId || !API) return;
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/bugs`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setQueue((prev) => ({ ...prev, [projectId]: data }));
      }
    } catch (err) { console.error("Fetch bugs failed", err); }
  }, []);

  const updateBugInState = useCallback((projectId: string, bugId: number, updates: Partial<Customer>) => {
    setQueue((prev) => {
      const projectList = prev[projectId] || [];
      return {
        ...prev,
        [projectId]: projectList.map((b) => b.id === bugId ? { ...b, ...updates } : b),
      };
    });
  }, []);

  const addQueue = async (projectId: string, customer: any) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(customer),
    });
    if (res.ok) {
      const newBug = await res.json();
      setQueue((prev) => ({ 
        ...prev, 
        [projectId]: [...(prev[projectId] ?? []), newBug] 
      }));
      return newBug.id;
    }
    return 0;
  };

  const removeQueue = async (projectId: string, id: number) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs/${id}`, { 
      method: 'DELETE', 
      headers: authHeaders() 
    });
    if (res.ok) {
      setQueue((prev) => ({ 
        ...prev, 
        [projectId]: (prev[projectId] ?? []).filter((b) => b.id !== id) 
      }));
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