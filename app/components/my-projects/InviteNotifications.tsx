'use client';
import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";

interface BackendInvite {
  id: number;
  project: {
    id: number;
    name: string;
    description?: string;
  };
  sender: {   
    name: string;
    email: string;
  };
  role: string;
  createdAt?: string;
}

export default function InviteNotifications() {
  const [invites, setInvites] = useState<BackendInvite[]>([]);
  const { token } = useAuthContext();

  const fetchInvites = async () => {
    try {
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/invites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data: BackendInvite[] = await res.json();
        setInvites(data);
      }
    } catch (err) {
      console.error('Fetch invites failed:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    
    fetchInvites();
    const interval = setInterval(fetchInvites, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleResponse = async (inviteId: number, action: "accept" | "decline") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/invites/${inviteId}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setInvites(prev => prev.filter(i => i.id !== inviteId));
        if (action === "accept") {
          window.dispatchEvent(new CustomEvent('projects-reload'));
        }
      } else {
        const errorText = await res.text();
        alert(`Failed to ${action}: ${errorText}`);
      }
    } catch (err) {
      console.error('Response failed:', err);
      alert(`Failed to ${action}`);
    }
  };

  // Role badge colors
  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-red-100 text-red-800 border-red-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
      member: 'bg-blue-100 text-blue-800 border-blue-200',
      editor: 'bg-blue-100 text-blue-800 border-blue-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Owner',
      admin: 'Owner',
      member: 'Member',
      editor: 'Member',
      viewer: 'Viewer',
    };
    return labels[role.toLowerCase()] || role;
  };

  if (invites.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
      
      <div className="fixed top-6 right-6 z-50 w-96 max-w-sm">
        {/* Header */}
        <div className="mb-4 p-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                📨
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Project Invites</h2>
                <p className="text-xs text-gray-500">{invites.length} {invites.length === 1 ? 'invitation' : 'invitations'}</p>
              </div>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db50 transparent' }}
        >
          {invites.map((invite, index) => (
            <div
              key={invite.id}
              className="group bg-gradient-to-b from-white/95 via-white/90 to-white/80 backdrop-blur-xl border border-white/60 shadow-2xl hover:shadow-3xl hover:border-blue-200/50 hover:-translate-y-1 transition-all duration-300 shrink-0 overflow-hidden rounded-3xl"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative p-6">
                <div className="flex items-start gap-4">
                  {/* Enhanced Project Avatar */}
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-2xl ring-2 ring-white/30 shrink-0 transform hover:scale-105 transition-transform duration-200">
                {invite.project.name[0]?.toUpperCase() || 'P'}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-md">
                      👥
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate pr-2">
                              {invite.project.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5"> {invite.sender.name} wants to invite you</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(invite.role)}`}>
                        {getRoleLabel(invite.role)}
                      </span>
                    </div>

                    {/* Sender Card */}
                    <div className="mb-4 p-3.5 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-inner">
                      <div className="flex items-center gap-3">
                        {/* Sender Avatar */}
                        <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/50">
                          {invite.sender.name[0]?.toUpperCase() || invite.sender.email[0]?.toUpperCase() || '?'}
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-xs">
                            ✓
                          </div>
                        </div>
                        
                        {/* Sender Info */}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {invite.sender.name}
                          </p>
                          <p className="text-xs text-blue-700 font-mono bg-white/60 px-2 py-0.5 rounded-lg border border-blue-200/50 truncate">
                            {invite.sender.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {invite.project.description && (
                      <div className="mb-5 px-1">
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200/50">
                          {invite.project.description}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 pt-1 border-t border-white/50">
                      <button
                        onClick={() => handleResponse(invite.id, "accept")}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white text-sm font-bold rounded-2xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ring-2 ring-emerald-400/30 hover:ring-emerald-400/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Join Project
                      </button>
                      
                      <button
                        onClick={() => handleResponse(invite.id, "decline")}
                        className="flex-none w-12 h-12 bg-gradient-to-r from-slate-100 to-white/80 backdrop-blur-sm border-2 border-slate-200 text-gray-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xl active:scale-[0.95] transition-all duration-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-slate-200/50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                {invite.createdAt && (
                  <div className="px-6 pb-4 text-right">
                    <p className="text-xs text-gray-400 font-mono">
                      {new Date(invite.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Count */}
        {invites.length > 1 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/60 px-4 py-2 rounded-xl shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                {invites.length} new invitations
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}