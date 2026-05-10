'use client';
import { useState } from 'react';

export interface Project {
  id: number;
  name: string;
  description?: string;
  role?: 'owner' | 'member' | 'viewer';
  type?: string;
}

interface Member {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'member' | 'viewer';
}

interface QueueItem {
  status: string;
}

type Queue = Record<string | number, QueueItem[]>;

interface DashboardHeaderProps {
  project: Project;
  id: string | number;
  queue: Queue;
  members?: Member[]; // 
}

export default function DashboardHeader({ project, id, queue, members = [] }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeCount = (queue[id] ?? []).filter(
    (c) => c.status === 'in-progress',
  ).length;

  const getRoleColor = (role: Member['role']) => {
    return role === 'owner'
      ? 'bg-gradient-to-br from-red-400 to-red-600'
      : role === 'member'
      ? 'bg-gradient-to-br from-blue-400 to-blue-600'
      : 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {project.name || 'QA Dashboard'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-snug break-words">
          {project.description || 'Monitor bugs, test cases, and status in real time'}
        </p>

        {/* Team Avatars */}
        {members.length > 0 && (
          <div className="flex items-center gap-2 mt-2 relative">
            <span className="text-xs text-gray-400 font-medium">Team:</span>
            <div 
              className="flex -space-x-2 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {members.slice(0, 3).map((member) => (
                <div
                  key={member.userId}
                  title={`${member.email} (${member.role})`}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform ${
                    getRoleColor(member.role)
                  }`}
                >
                  {member.email[0]?.toUpperCase()}
                </div>
              ))}
              {members.length > 3 && (
                <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-105 transition-transform bg-gradient-to-br from-purple-400 to-purple-600 cursor-pointer`}>
                  +{members.length - 3}
                </div>
              )}
            </div>

            {/* Members Menu - Same exact styling */}
            {isMenuOpen && (
              <div className="absolute top-14 left-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Team Members ({members.length})
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${getRoleColor(member.role)}`}>
                        {member.email[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                             <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{member.email}</p>
                   
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-12 w-px bg-gray-200" />
        <div className="text-right">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-purple-600">{activeCount}</p>
        </div>
      </div>
    </div>
  );
}