"use client";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12" style={{ background: "#4F46E5" }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-300" />
          <span className="text-white text-xl font-medium">QAFlow</span>
        </div>

        <div>
          <h2 className="text-3xl font-medium text-white leading-snug mb-3">
            Accelerate your<br />QA workflow
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-8">
            Track bugs, manage projects, and collaborate with your team in real time.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: "✓", text: "Smart duplicate bug detection" },
              { icon: "▦", text: "Real-time project dashboards" },
              { icon: "◷", text: "Export reports to Excel instantly" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: "rgba(255,255,255,0.15)" }}>
                  {f.icon}
                </div>
                <span className="text-purple-100 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-purple-300 text-xs">© 2026 QAFlow. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-10 bg-gray-50">
        <div className="bg-white border border-gray-100 rounded-2xl p-9 w-full max-w-sm shadow-sm">

          {/* Tabs */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="flex-1 py-2 text-center text-sm font-medium text-white" style={{ background: "#4F46E5" }}>
              Sign in
            </div>
            <Link href="/register" className="flex-1 py-2 text-center text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition">
              Register
            </Link>
          </div>

          <p className="text-sm text-gray-500 mb-6">Welcome back — sign in to your account</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#4F46E5" } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#4F46E5" } as React.CSSProperties}
              />
              <div className="text-right mt-1.5">
                <button type="button" className="text-xs font-medium" style={{ color: "#4F46E5" }}>
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 mt-2"
              style={{ background: "#4F46E5" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button className="w-full py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium" style={{ color: "#4F46E5" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}