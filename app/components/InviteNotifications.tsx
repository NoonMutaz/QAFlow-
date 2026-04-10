"use client";
import { useEffect, useState } from "react";

interface BackendInvite {
  id: number;
  role: string;
  status: string;
  project: {
    id: number;
    name: string;
    description: string;
  };
}

export default function InviteNotifications() {
  const [invites, setInvites] = useState<BackendInvite[]>([]);
  const maxHeight = '80vh'; // ✅ Max height before scroll

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/invites`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store' // Fresh data
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setInvites(data);
      }
    } catch (err) {
      console.error('Fetch invites failed:', err);
    }
  };

  // Poll every 30s
  useEffect(() => {
    fetchInvites();
    const interval = setInterval(fetchInvites, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResponse = async (inviteId: number, action: "accept" | "decline") => {
    try {
      const token = localStorage.getItem("token");
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
          // Soft reload - dispatch custom event
          window.dispatchEvent(new CustomEvent('projects-reload'));
        }
      }
    } catch (err) {
      console.error('Response failed:', err);
      alert(`Failed to ${action}`);
    }
  };

  if (invites.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      {/* ✅ Scrollable Container */}
      <div 
        className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
      >
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-2xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 shrink-0"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                {invite.project.name[0]?.toUpperCase() || 'P'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-base truncate">
                    {invite.project.name}
                  </h3>
                  <span className="text-xs text-gray-400 font-mono px-2 py-0.5 bg-gray-100 rounded">
                    {invite.role}
                  </span>
                </div>

                {invite.project.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {invite.project.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleResponse(invite.id, "accept")}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 active:scale-95"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(invite.id, "decline")}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 active:scale-95"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Notification Count */}
      {invites.length > 1 && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {invites.length} invitations
          </span>
        </div>
      )}
    </div>
  );
}