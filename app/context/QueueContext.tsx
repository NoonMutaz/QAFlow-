"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import Fuse from "fuse.js";
export type Status = "notFixed" | "in-progress" | "fixed";
export type Priority = "High" | "Medium" | "Low";

export interface Customer {
  id: number;
  name: string;
  priority: Priority;
  status: Status;
  bugId: string;
  createdAt: number;
   description: string;
   url:string;
     expectedResult: string;
  actualResult: string;
  note:string;
  
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
  const projectQueue = queue[projectId] || [];
const fuse = new Fuse(projectQueue, {
  keys: ["expectedResult", "actualResult", "description"],
  threshold: 0.4,
});

const searchText =
  customer.expectedResult +
  " " +
  customer.actualResult +
  " " +
  customer.description;

const results = fuse.search(searchText);
if (results.length > 0) {
  alert(`Possible duplicate bug: ${results[0].item.bugId}`);
  return ;
}

    setQueue((prev) => {
    
  //  const similarBug = projectQueue.find((b) => {
  //     const expectedSim = b.expectedResult.trim().toLowerCase() === customer.expectedResult.trim().toLowerCase();
  //     const actualSim = b.actualResult.trim().toLowerCase() === customer.actualResult.trim().toLowerCase();
  //     return expectedSim && actualSim;
  //   });

  //   if (similarBug) {
  //     alert(`A similar bug already exists in : ${similarBug.bugId}`);
  //     return prev; // don't add the new bug
  //   }


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