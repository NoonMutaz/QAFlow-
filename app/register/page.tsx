"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";

function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { label: "Weak",   color: "#E24B4A" },
      { label: "Fair",   color: "#EF9F27" },
      { label: "Good",   color: "#4F46E5" },
      { label: "Strong", color: "#1D9E75" },
    ];
    return { score, ...( levels[score - 1] ?? { label: "", color: "" }) };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < score ? color : "#E5E7EB" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  );
}

export default function RegisterPage() {
  const { register, error, loading } = useAuth();
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [agreed, setAgreed]         = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (password !== confirm) {
      setLocalError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setLocalError("Please agree to the terms");
      return;
    }
    await register(`${firstName} ${lastName}`, email, password);
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent";
  const ringStyle = { "--tw-ring-color": "#4F46E5" } as React.CSSProperties;

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
            Start tracking bugs<br />in minutes
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-8">
            Join QA teams who ship better software faster with QAFlow.
          </p>
          <div className="flex flex-col gap-5">
            {[
              { num: "1", title: "Create your account",  sub: "Free to get started, no credit card needed" },
              { num: "2", title: "Create a project",     sub: "Organize bugs by project or team" },
              { num: "3", title: "Start logging bugs",   sub: "Smart detection prevents duplicates automatically" },
            ].map((s) => (
              <div key={s.num} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.2)" }}>
                  {s.num}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{s.title}</p>
                  <p className="text-purple-200 text-xs mt-0.5">{s.sub}</p>
                </div>
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
            <Link href="/login" className="flex-1 py-2 text-center text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition">
              Sign in
            </Link>
            <div className="flex-1 py-2 text-center text-sm font-medium text-white" style={{ background: "#4F46E5" }}>
              Register
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-5">Create your free QAFlow account</p>

          {(error || localError) && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-100">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">First name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John" required className={inputClass} style={ringStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe" required className={inputClass} style={ringStyle} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Work email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" required className={inputClass} style={ringStyle} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters" required className={inputClass} style={ringStyle} />
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" required className={inputClass} style={ringStyle} />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-indigo-600"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                I agree to the{" "}
                <span className="font-medium" style={{ color: "#4F46E5" }}>Terms of Service</span>
                {" "}and{" "}
                <span className="font-medium" style={{ color: "#4F46E5" }}>Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white rounded-lg transition disabled:opacity-50"
              style={{ background: "#4F46E5" }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "#4F46E5" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}