// hooks/useQueue.ts

import { useState, useMemo } from "react";

type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";

interface Customer {
  id: number;
  name: string;
  priority: Priority;
  status: Status;
  createdAt: number;
  bugId: string;
  url: string;
  expectedResult: string;
  actualResult: string;
  description: string;
  note: string;
}
export function useQueue(QueueData: Customer[]) {
  const [queue, setQueue] = useState<Customer[]>(QueueData);

  const addQueue = (customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">) => {
    setQueue((prev) => {
          // const projectQueue = prev[projectId] || [];

     const lastNumber =
        prev.length > 0
          ? Math.max(...prev.map((b) => Number(b.bugId.split("-")[1])))
          : 0;

      const bugId = `BUG-${String(lastNumber + 1).padStart(3, "0")}`;

      return [
        ...prev,
        {
          ...customer,
          id: Date.now(),
          bugId,
          status: "notFixed",
          createdAt: Date.now(),
        },
      ];
    });
  };

  const updateQueue = (id: number, newStatus: Status) => {
    setQueue((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const removeQueue = (id: number) => {
    setQueue((prev) => prev.filter((c) => c.id !== id));
  };

  const updatePriorityQueue = (id: number, newPriority: Priority) => {
    setQueue((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, priority: newPriority } : customer
      )
    );
  };

  return {
    queue,
    addQueue,
    updateQueue,
    removeQueue,
    updatePriorityQueue,
  };
}