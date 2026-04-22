"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import { useQueueContext } from "../context/QueueContext";
import { useProjects } from "../context/ProjectContext";

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;

export function useAuth() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  //  Single context destructuring
  const { setAuth, clearAuth } = useAuthContext();
  const { clearQueue } = useQueueContext();
  const { clearProjects } = useProjects();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(""); //  Clear previous errors
    
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Invalid credentials");
      }

      const data = await res.json();

      //   Clear data ONLY after successful login
      clearQueue();
      clearProjects();
      
      //   Set auth state
      setAuth(data.user, data.token);

      //   Set cookie
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      router.push("/my-projects");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(""); //  Clear previous errors
    
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Register error:", text);
        throw new Error(text || "Registration failed");
      }

      //  Success - redirect to login
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearAuth();
    clearQueue();
    clearProjects();
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  return { register, login, signOut, error, loading };
}