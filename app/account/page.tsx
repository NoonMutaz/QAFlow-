'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { useQueueContext } from '../context/QueueContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, token, clearAuth } = useAuthContext();
  const { projects } = useProjects();
  const { queue, fetchBugs } = useQueueContext();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   useEffect(() => {
//     if (user) {
//       setForm({ name: user.name || '', email: user.email || '' });
//     }
//   }, [user]);
useEffect(() => {
  if (projects.length) {
    projects.forEach(p => fetchBugs(p.id));
  }
}, [projects]);
  // Stats
const allBugs = Object.values(queue).flat();

const totalBugs = allBugs.length;

const fixedBugs = allBugs.filter(b => b.status === "fixed").length;

const activeBugs = totalBugs - fixedBugs;

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });

      if (res.ok) {
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
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };
const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    badge: '',
    features: [
      'Track bugs in 2 project',
      'Up to 50 bugs',
      'Simple status workflow',
      'Clean, distraction-free UI'
    ],
    cta: 'Start for free',
    tone: 'For trying QAFlow',
    current: true,
  },
  {
    name: 'Builder',
    price: '$12',
    period: 'per month',
    badge: 'Most Popular',
    features: [
      'Unlimited projects & bugs',
      'Smart duplicate detection',
      'Advanced search & filters',
      'Priority & workflow control',
      'Basic analytics (bug trends)',
    ],
    cta: 'Upgrade to Builder',
    tone: 'For serious developers',
    current: false,
  },
  {
    name: 'Team',
    price: '$40',
    period: 'per month',
    badge: '',
    features: [
      
      'Team collaboration',
      'Roles (QA / Dev / Admin)',
      'Comments & activity tracking',
      'Attachments & screenshots',
      'Shared dashboards',
    ],
    cta: 'Start with your team',
    tone: 'For small teams shipping fast',
    current: false,
  },
];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/80 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-indigo-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{user?.name}</h1>
              <p className="text-gray-500 mt-0.5 truncate">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                  Free Plan
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-semibold rounded-full">
                  ● Active
                </span>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all self-start sm:self-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Projects', value: projects.length, color: 'blue', icon: ' ' },
            { label: 'Total Bugs', value: totalBugs, color: 'gray', icon: ' ' },
            { label: 'Active Bugs', value: activeBugs, color: 'amber', icon: ' ' },
            { label: 'Fixed', value: fixedBugs, color: 'green', icon: ' ' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/90 backdrop-blur-sm rounded-xl border border-indigo-100 p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
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
                {tab === 'profile' ? '  Profile' : '  Subscription'}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIsEditing(false); setErrors({}); }}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    {isEditing ? (
                      <>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </>
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-200">
                        {user?.name || '—'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </>
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-200">
                        {user?.email || '—'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-red-600 mb-3">Danger Zone</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Delete Account</p>
                      <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-xl hover:bg-red-100 transition-all whitespace-nowrap">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Choose Your Plan</h2>
                  <p className="text-sm text-gray-500 mt-1">Upgrade to unlock more features for your team</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative rounded-2xl border-2 p-6 transition-all ${
                        plan.current
                          ? 'border-blue-500 bg-blue-50/50 shadow-md'
                          : plan.name === 'Pro'
                          ? 'border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      {plan.current && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                          Current Plan
                        </span>
                      )}
                      {plan.name === 'Pro' && !plan.current && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                          Most Popular
                        </span>
                      )}

                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                          <span className="text-sm text-gray-500">/{plan.period}</span>
                        </div>
                      </div>
{plan.badge && (
  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
    {plan.badge}
  </span>
)}
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        disabled={plan.current}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          plan.current
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : plan.name === 'Pro'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                      >
                        {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Billing Info */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment processing coming soon. Plans are shown for preview purposes.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}