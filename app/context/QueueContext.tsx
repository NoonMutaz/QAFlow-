"use client";
import { createContext, useContext, useState } from "react";
import { QueueData } from "../data/QueueData";
type Status = "notFixed" | "in-progress" | "fixed";
type Priority = "High" | "Medium" | "Low";
const QueueContext = createContext<any>(null);

export function QueueProvider({ children }) {
  const [queue, setQueue] = useState(QueueData);

  const addQueue = (customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">) => {
    setQueue((prev) => {
      
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
  const removeQueue = (id) => {
    setQueue((prev) => prev.filter((b) => b.id !== id));
  };

  const updateQueue = (id, status) => {
    setQueue((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  
  const updatePriorityQueue = (id: number, newPriority: Priority) => {
    setQueue((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, priority: newPriority } : customer
      )
    );
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