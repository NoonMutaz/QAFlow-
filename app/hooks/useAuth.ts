"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import { useQueueContext } from "../context/QueueContext";
import { useProjects } from "../context/ProjectContext";

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/auth`;

export function useAuth() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { setAuth, clearAuth } = useAuthContext();
  const { clearQueue } = useQueueContext();
  const { clearProjects } = useProjects();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Invalid credentials");
      }

      clearQueue();
      clearProjects();

      setAuth(data.user, data.token);

      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      router.push("/my-projects");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
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