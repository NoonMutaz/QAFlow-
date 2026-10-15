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
import { useLanguage } from '../../i18n/LanguageProvider';

export default function Account() {
  const { t } = useLanguage();
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

  // Memoized compliance findings calculation
  const stats = useMemo(() => {
    const allBugs = Object.values(queue).flat() as Bug[];
    const total = allBugs.length;
    const fixed = allBugs.filter((b) => b.status === 'fixed').length;
    const inProgress = allBugs.filter((b) => b.status === 'in-progress').length;
    return {
      totalBugs: total,
      fixedBugs: fixed,
      activeBugs: total - fixed,
      inProgress: inProgress
    };
  }, [queue]);

  const handleSave = async () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!form.name.trim()) newErrors.name = 'Full Name is required';
    if (!form.email.trim()) newErrors.email = 'Corporate Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
        alert('✅ Profile updated successfully!');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-3xl shadow-md flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-100 truncate">{user?.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5 truncate">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-full">
                  {t("Standard Tier")}
                </span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}{t("Compliance Active")}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-400 border border-rose-900/40 bg-rose-950/20 rounded-xl hover:bg-rose-900/30 transition-all self-start sm:self-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t("Sign Out")}
            </button>
          </div>
        </div>

        {/* Aggregate Audit Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label={t("Active Audits")} value={projects.length} />
          <StatCard label={t("Total Findings")} value={stats.totalBugs} />
          <StatCard label={t("Pending Action")} value={stats.activeBugs} />
          <StatCard label={t("Compliant / Resolved")} value={stats.fixedBugs} />
        </div>

        {/* Tab Shell Switcher Container */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-800">
            {(['profile', 'subscription'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {tab === 'profile' ? 'Profile Info' : 'Enterprise Plans'}
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