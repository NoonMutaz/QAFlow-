"use client";
import { createContext, useContext, useState } from "react";
import { QueueData } from "../data/QueueData";
type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";
const QueueContext = createContext<any>(null);

export function QueueProvider({ children }) {
const [queue, setQueue] = useState<{ [projectId: string]: Customer[] }>({});
const addQueue = (projectId: string, customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">) => {
  setQueue((prev) => {
    const projectQueue = prev[projectId] || [];
      const lastNumber =
        prev.length > 0
          ? Math.max(...prev.map((b) => Number(b.bugId.split("-")[1])))
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
  const removeQueue = (id) => {
    setQueue((prev) => prev.filter((b) => b.id !== id));
  };

  const updateQueue = (id, status) => {
    setQueue((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };
function similarity(a: string, b: string) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  const wordsA = new Set(a.split(" "));
  const wordsB = new Set(b.split(" "));

  const common = [...wordsA].filter((w) => wordsB.has(w));

  return common.length / Math.max(wordsA.size, wordsB.size);
}
  
const updatePriorityQueue = (projectId: string, id: number, newPriority: Priority) => {
  setQueue((prev) => ({
    ...prev,
    [projectId]: (prev[projectId] || []).map((customer) =>
      customer.id === id ? { ...customer, priority: newPriority } : customer
    ),
  }));
};

  return (
    <QueueContext.Provider
      value={{ queue, addQueue, removeQueue, updateQueue ,updatePriorityQueue}}
    >
      {children}
    </QueueContext.Provider>
  );
}

export const useQueueContext = () => useContext(QueueContext);