"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Status = "notFixed" | "in-progress" | "fixed";
export type Priority = "High" | "Medium" | "Low";

export interface Customer {
  id: number;
  name: string;
  priority: Priority;
  status: Status;
  bugId: string;
  createdAt: number;
}

interface QueueContextType {
  queue: Record<string, Customer[]>;
  addQueue: (projectId: string, customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">) => void;
  removeQueue: (projectId: string, id: number) => void;
  updateQueue: (projectId: string, id: number, status: Status) => void;
  updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const QueueProvider = ({ children }: ProviderProps) => {
  const [queue, setQueue] = useState<Record<string, Customer[]>>({});

  const addQueue = (
    projectId: string,
    customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">
  ) => {
    setQueue((prev) => {
      const projectQueue = prev[projectId] || [];

      // Generate next bugId
      const lastNumber =
        projectQueue.length > 0
          ? Math.max(...projectQueue.map((b) => Number(b.bugId.split("-")[1])))
          : 0;

      const bugId = `BUG-${String(lastNumber + 1).padStart(3, "0")}`;

      return {
        ...prev,
        [projectId]: [
          ...projectQueue,
          {
            ...customer,
            id: Date.now(),
            bugId,
            status: "notFixed",
            createdAt: Date.now(),
          },
        ],
      };
    });
  };

  const removeQueue = (projectId: string, id: number) => {
    setQueue((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter((b) => b.id !== id),
    }));
  };

  const updateQueue = (projectId: string, id: number, status: Status) => {
    setQueue((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    }));
  };

  const updatePriorityQueue = (
    projectId: string,
    id: number,
    newPriority: Priority
  ) => {
    setQueue((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((b) =>
        b.id === id ? { ...b, priority: newPriority } : b
      ),
    }));
  };

  return (
    <QueueContext.Provider
      value={{ queue, addQueue, removeQueue, updateQueue, updatePriorityQueue }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueueContext = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error("useQueueContext must be used within QueueProvider");
  return context;
};