'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { useQueueContext } from '../../context/QueueContext';

// Import split modules
import StatCard from './StatCard';
import ProfileTab from './ProfileTab';
import SubscriptionTab from './SubscriptionTab';
import { SUBSCRIPTION_PLANS } from './constants';
import { Bug } from './types';

export default function Account() {
  const { user, token, clearAuth, updateUser } = useAuthContext();
  const { projects } = useProjects();
  const { queue, fetchBugs } = useQueueContext();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    if (projects?.length) {
      projects.forEach((p) => fetchBugs(p.id.toString()));
    }
  }, [projects, fetchBugs]);

  // Memoized stats calculation
  const stats = useMemo(() => {
    const allBugs = Object.values(queue).flat() as Bug[];
    const total = allBugs.length;
    const fixed = allBugs.filter((b) => b.status === 'fixed').length;
    return {
      totalBugs: total,
      fixedBugs: fixed,
      activeBugs: total - fixed,
    };
  }, [queue]);

  const handleSave = async () => {
    //   Proper structured error evaluation block
    const newErrors: { name?: string; email?: string } = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear runtime errors if validations pass
    setErrors({});
    setIsSaving(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
        alert('✅ Profile updated!');
        setIsEditing(false);
      } else {
        alert('❌ Failed to update profile');
      }
    } catch {
      alert('❌ Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    clearAuth();
    document.cookie = 'token=; path=/; max-age=0;';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/80 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{user?.name}</h1>
              <p className="text-gray-500 mt-0.5 truncate">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-semibold rounded-full">Free Plan</span>
                <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-semibold rounded-full">● Active</span>
              </div>
            </div>
<div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all self-start sm:self-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button></div>
          </div>
        </div>

        {/* Aggregate Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Total Bugs" value={stats.totalBugs} />
          <StatCard label="Active Bugs" value={stats.activeBugs} />
          <StatCard label="Fixed" value={stats.fixedBugs} />
        </div>

        {/* Tab Shell Switcher Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['profile', 'subscription'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'profile' ? (
              <ProfileTab
                user={user}
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                isSaving={isSaving}
                handleSave={handleSave}
              />
            ) : (
              <SubscriptionTab plans={SUBSCRIPTION_PLANS} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}