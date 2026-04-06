"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext"; //  import context

const API = "https://localhost:7295/api/auth";

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthContext(); //  get setAuth
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid email or password");

      const data = await res.json();
      console.log("API response:", data); //  check what shape comes back

      //  this updates context + localStorage + cookie all at once
      setAuth(data.user, data.token);

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearAuth(); // clears context + localStorage + cookie
    router.push("/login");
  };

  return { register, login, signOut, error, loading };
}