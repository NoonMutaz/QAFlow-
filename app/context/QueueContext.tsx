// "use client";
// import { createContext, useContext, useState, ReactNode } from "react";
// import Fuse from "fuse.js";
// import { useLocalStorage } from '../hooks/useLocalStorage';
// export type Status = "notFixed" | "in-progress" | "fixed";
// export type Priority = "High" | "Medium" | "Low";

// export interface Customer {
//   id: number;
//   name: string;
//   priority: Priority;
//   status: Status;
//   bugId: string;
//   createdAt: number;
//    description: string;
//    url:string;
//      expectedResult: string;
//   actualResult: string;
//   note:string;
  
// }

// interface QueueContextType {
//   queue: Record<string, Customer[]>;
//   addQueue: (projectId: string, customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">) => void;
//   removeQueue: (projectId: string, id: number) => void;
//   updateQueue: (projectId: string, id: number, status: Status) => void;
//   updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => void;
// }

// const QueueContext = createContext<QueueContextType | undefined>(undefined);

// interface ProviderProps {
//   children: ReactNode;
// }

// export const QueueProvider = ({ children }: ProviderProps) => {
//   // const [queue, setQueue] = useState<Record<string, Customer[]>>({});
//  const [queue, setQueue] = useLocalStorage<Record<string, Customer[]>>("queue", {});  
//   const addQueue = (
//     projectId: string,
//     customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">
//   ) => {
//   const projectQueue = queue[projectId] || [];
// const fuse = new Fuse(projectQueue, {
//   keys: ["expectedResult", "actualResult", "description"],
//   threshold: 0.4,
// });

// const searchText =
//   customer.expectedResult +
//   " " +
//   customer.actualResult +
//   " " +
//   customer.description;

// const results = fuse.search(searchText);
// if (results.length > 0) {
//   alert(`Possible duplicate bug: ${results[0].item.bugId}`);
//   return ;
// }

//     setQueue((prev) => {
    
//   //  const similarBug = projectQueue.find((b) => {
//   //     const expectedSim = b.expectedResult.trim().toLowerCase() === customer.expectedResult.trim().toLowerCase();
//   //     const actualSim = b.actualResult.trim().toLowerCase() === customer.actualResult.trim().toLowerCase();
//   //     return expectedSim && actualSim;
//   //   });

//   //   if (similarBug) {
//   //     alert(`A similar bug already exists in : ${similarBug.bugId}`);
//   //     return prev; // don't add the new bug
//   //   }


//       // Generate next bugId
//       const lastNumber =
//         projectQueue.length > 0
//           ? Math.max(...projectQueue.map((b) => Number(b.bugId.split("-")[1])))
//           : 0;

//       const bugId = `BUG-${String(lastNumber + 1).padStart(3, "0")}`;

//       return {
//         ...prev,
//         [projectId]: [
//           ...projectQueue,
//           {
//             ...customer,
//             id: Date.now(),
//             bugId,
//             status: "notFixed",
//             createdAt: Date.now(),
//           },
//         ],
//       };
//     });
//   };

//   const removeQueue = (projectId: string, id: number) => {
//     setQueue((prev) => ({
//       ...prev,
//       [projectId]: (prev[projectId] || []).filter((b) => b.id !== id),
//     }));
//   };

//   const updateQueue = (projectId: string, id: number, status: Status) => {
//     setQueue((prev) => ({
//       ...prev,
//       [projectId]: (prev[projectId] || []).map((b) =>
//         b.id === id ? { ...b, status } : b
//       ),
//     }));
//   };

//   const updatePriorityQueue = (
//     projectId: string,
//     id: number,
//     newPriority: Priority
//   ) => {
//     setQueue((prev) => ({
//       ...prev,
//       [projectId]: (prev[projectId] || []).map((b) =>
//         b.id === id ? { ...b, priority: newPriority } : b
//       ),
//     }));
//   };

//   return (
//     <QueueContext.Provider
//       value={{ queue, addQueue, removeQueue, updateQueue, updatePriorityQueue }}
//     >
//       {children}
//     </QueueContext.Provider>
//   );
// };

// export const useQueueContext = () => {
//   const context = useContext(QueueContext);
//   if (!context) throw new Error("useQueueContext must be used within QueueProvider");
//   return context;
// };


"use client";
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
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
  url: string;
  expectedResult: string;
  actualResult: string;
  note: string;
   attachmentUrl?: string; 
}

interface QueueContextType {
  queue: Record<string, Customer[]>;
  addQueue: (projectId: string, customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">) => Promise<number>;
  removeQueue: (projectId: string, id: number) => Promise<void>;
  updateQueue: (projectId: string, id: number, status: Status) => Promise<void>;
  updatePriorityQueue: (projectId: string, id: number, newPriority: Priority) => Promise<void>;
  fetchBugs: (projectId: string) => Promise<void>;
    clearQueue: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Record<string, Customer[]>>({});

  const fetchBugs = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setQueue(prev => ({ ...prev, [projectId]: data }));
      }
    } catch (err) {
      console.error("Failed to fetch bugs:", err);
    }
  }, []);

 const addQueue = async (
  projectId: string,
  customer: Omit<Customer, "id" | "status" | "createdAt" | "bugId">
): Promise<number> => { // ← return number
  const projectQueue = queue[projectId] || [];
  const fuse = new Fuse(projectQueue, {
    keys: ["expectedResult", "actualResult", "description"],
    threshold: 0.4,
  });
  const results = fuse.search(`${customer.expectedResult} ${customer.actualResult} ${customer.description}`);
  if (results.length > 0) {
    alert(`Possible duplicate bug: ${results[0].item.bugId}`);
    return 0; // ← return 0 instead of void
  }

  try {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(customer),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to create bug:", res.status, text);
      return 0; // ← return 0 on failure
    }

    const newBug = await res.json();
    setQueue(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newBug],
    }));

    return newBug.id; // ← return the new bug id
  } catch (err) {
    console.error("addQueue error:", err);
    return 0;
  }
};

  const removeQueue = async (projectId: string, id: number) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.ok) {
      setQueue(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter(b => b.id !== id),
      }));
    }
  };

  const updateQueue = async (projectId: string, id: number, status: Status) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setQueue(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(b => b.id === id ? { ...b, status } : b),
      }));
    }
  };

  const updatePriorityQueue = async (projectId: string, id: number, newPriority: Priority) => {
    const res = await fetch(`${API}/api/projects/${projectId}/bugs/${id}/priority`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ priority: newPriority }),
    });

    if (res.ok) {
      setQueue(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(b => b.id === id ? { ...b, priority: newPriority } : b),
      }));
    }
  };
const clearQueue = () => {
  setQueue({});
};
  return (
    <QueueContext.Provider value={{ clearQueue, queue, addQueue, removeQueue, updateQueue, updatePriorityQueue, fetchBugs }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueueContext = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error("useQueueContext must be used within QueueProvider");
  return context;
};