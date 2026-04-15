'use client';

import { useState, FormEvent } from "react";

interface Member {
 id: string;       
  userId: string;
  email: string;
  role: 'owner' | 'member' | 'viewer';
  joinedAt: string;
   
}

interface InviteModalProps {
  customer: {
    id: string;
    name: string;
     removingMemberId?: string | null;
        onRemoveMember: (memberId: string) => Promise<void>;
  };
  members: Member[]; // Existing members
  onClose: () => void;
  isOpen: boolean;
  onInvite: (email: string) => Promise<void>;
  onUpdateMember: (memberId: string, role: Member['role']) => Promise<void>;
onRemoveMember: (memberId: string) => Promise<void>;
}

export default function InviteModal({
  isOpen,
  onClose,
  onInvite,
  onUpdateMember,
  onRemoveMember,
  customer,
  members,
 projectId,
  handleRemoveMember,
  removingMemberId,
  handleUpdateRole
}: InviteModalProps) {
  const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInviteSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      alert("⚠️ Please enter an email!");
      return;
    }

    setIsSending(true);
    try {
      await onInvite(email.trim());
      setEmail("");
      // Optionally switch to members tab after successful invite
      // setActiveTab('members');
    } catch (error) {
      console.error("Invite failed:", error);
    } finally {
      setIsSending(false);
    }
  };
   const currentUserId = localStorage.getItem('userId') || '';

const isOwnerOrSelf = (member: Member) => {
  return member.userId === currentUserId;
};
  // const handleUpdateRole = async (memberId: string, role: Member['role']) => {
  //   setUpdatingMemberId(memberId);
  //   try {
  //     await onUpdateMember(memberId, role);
  //   } catch (error) {
  //     console.error("Update failed:", error);
  //   } finally {
  //     setUpdatingMemberId(null);
  //   }
  // };
// const handleRemoveMember = async (memberId: string) => {
//   if (!projectId) return;

//   const token = localStorage.getItem('token');

//   setUpdatingMemberId(memberId);

//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/members/${memberId}`,
//       {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!res.ok) {
//       throw new Error(await res.text());
//     }

//     await onRemoveMember(memberId); // parent sync
//   } catch (err) {
//     console.error(err);
//     alert("Failed to remove member");
//   } finally {
//     setUpdatingMemberId(null);
//   }
// };

  const RoleBadge = ({ role }: { role: Member['role'] }) => {
    const colors = {
      owner: 'bg-red-100 text-red-800 border-red-200',
      member: 'bg-blue-100 text-blue-800 border-blue-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200'
    } as const;

    const labels = {
      owner: 'Owner',
      member: 'Member',
      viewer: 'Viewer'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[role]}`}>
        {labels[role]}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage members for <span className="font-medium text-blue-600">{customer.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            // disabled={isSending}
         disabled={isSending}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Project Card */}
        <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
            {customer.name[0]?.toUpperCase() || 'P'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              ID: {String(customer.id).slice(-8)} • {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 mx-6 -mt-4">
          <nav className="flex space-x-1 bg-white">
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'invite'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Invite New
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Members ({members.length})
            </button>
          </nav>
        </div>

         
     {/* Content */}
<div className="p-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {activeTab === 'invite' ? (
            /* Invite Form */
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Team Member Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  disabled={isSending}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  They'll get a notification to accept or decline the invite.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('members')}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  View Members
                </button>
                <button
                  type="submit"
                  disabled={!email.trim() || isSending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Members List */
     <div className="space-y-4">
  {members.length === 0 ? (
    <div className="text-center py-12 text-gray-500">
      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="font-medium text-gray-600">No members yet</p>
      <p className="text-sm mt-1">Invite someone to get started</p>
    </div>
  ) : (
    
    <div className="space-y-3">
      {members.map((member) => {
        const isSelf = member.userId === currentUserId;
        const isOwner = member.role === 'owner';
        const disableRoleChange = isSelf || isOwner;

        return (
          <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {member.email[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{member.email}</p>
                <p className="text-xs text-gray-500">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <RoleBadge role={member.role} />
              
              <select
                value={member.role}
              onChange={(e) =>
  onUpdateMember(member.userId, e.target.value as Member['role'])
}
                disabled={disableRoleChange}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all"
              >
                <option value="viewer">Viewer</option>
                <option value="member">Member</option>
                <option value="owner">Owner</option>
              </select>

              <button
           onClick={() => onRemoveMember(member.userId)}
                disabled={removingMemberId === member.id || updatingMemberId === member.id}
                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all disabled:opacity-50"
                title="Remove member"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
 
)}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('invite')}
                  className="flex-1 sticky px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
                >
                  + Invite New Member
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}