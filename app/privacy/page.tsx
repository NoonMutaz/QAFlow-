'use client';
import { useState } from 'react';
import Contactus from '../components/AboutUs/Contactus';
// import { ShieldCheckIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('1');

  const sections = [
    {
      id: '1',
      title: 'Information We Collect',
      //icon: ShieldCheckIcon,
      content: `
        <p className="mb-4 text-gray-700 leading-relaxed">
          We collect minimal information necessary to provide our bug tracking and project management services:
        </p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-gray-900">Account Information:</strong> Email, name (optional)
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
            <LockClosedIcon className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-gray-900">Project Data:</strong> Project names, descriptions, bug reports, team members
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border-l-4 border-purple-500">
            <UserGroupIcon className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-gray-900">Team Collaboration:</strong> Invites, role assignments, member emails
            </div>
          </li>
        </ul>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-sm text-gray-700">
            <strong>✅ No unnecessary data:</strong> We don't collect payment info, location, or personal identifiers beyond what's needed for team collaboration.
          </p>
        </div>
      `
    },
    {
      id: '2',
      title: 'How We Use Your Information',
     // icon: ShieldCheckIcon,
      content: `
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">🎯 Core Services</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Bug tracking & project management</li>
                <li>• Team collaboration & invites</li>
                <li>• Role-based access control</li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🔒 Security & Operations</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Authentication & authorization</li>
                <li>• Service improvement (anonymized)</li>
                <li>• Abuse prevention</li>
              </ul>
            </div>
          </div>
        </div>
        <blockquote className="border-l-4 border-indigo-500 bg-indigo-50 pl-6 py-4 italic text-gray-700">
          We never sell your data or use it for advertising.
        </blockquote>
      `
    },
    {
      id: '3',
      title: 'Data Sharing & Security',
    //  icon: LockClosedIcon,
      content: `
        <div className="grid gap-6">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200">
            <h4 className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
              <LockClosedIcon className="w-6 h-6 text-red-500" />
              No Third-Party Sharing
            </h4>
            <p className="text-gray-700 mb-4">
              Your project data stays within our secure infrastructure. We don't share with:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl mb-1">🚫</div>
                <div className="text-xs font-medium text-gray-900">Analytics</div>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl mb-1">🚫</div>
                <div className="text-xs font-medium text-gray-900">Advertisers</div>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm border">
                <div className="text-2xl mb-1">🚫</div>
                <div className="text-xs font-medium text-gray-900">Data Brokers</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
            <h4 className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
              🛡️ Security Measures
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <li className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border">
                <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-0.5 flex-shrink-0">🔐</div>
                <span>End-to-end encryption for data at rest & transit</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border">
                <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-0.5 flex-shrink-0">👥</div>
                <span>Role-based access control (Owner/Member/Viewer)</span>
              </li>
                           <li className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border">
                <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-0.5 flex-shrink-0">🛡️</div>
                <span>Regular security audits & penetration testing</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border">
                <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mt-0.5 flex-shrink-0">📱</div>
                <span>Secure JWT authentication with short-lived tokens</span>
              </li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: '4',
      title: 'Your Rights & Data Control',
    //  icon: UserGroupIcon,
      content: `
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-xl text-gray-900 mb-4">👤 Individual Rights</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border">
                <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">📥</div>
                <span><strong>Access:</strong> Download your project data anytime</span>
              </li>
              <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border">
                <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">🗑️</div>
                <span><strong>Delete:</strong> Remove projects & account permanently</span>
              </li>
              <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border">
                <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">⚙️</div>
                <span><strong>Control:</strong> Manage team members & permissions</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xl text-gray-900 mb-4">🚀 Team Admin Rights</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border">
                <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">👑</div>
                <span><strong>Full Control:</strong> Invite/remove members, assign roles</span>
              </li>
              <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border">
                <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">📊</div>
                <span><strong>Export:</strong> Download project data & reports</span>
              </li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: '5',
      title: 'Cookies & Tracking',
   //   icon: ShieldCheckIcon,
      content: `
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-4">
            <h4 className="font-bold text-lg text-gray-900 mb-2">🍪 Minimal Cookie Usage</h4>
            <p className="text-sm text-gray-700 mb-4">
              We use <strong>essential cookies only</strong> for authentication and session management:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-xl shadow-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Cookie</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Purpose</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3 font-mono text-xs bg-gray-50">auth_token</td>
                    <td className="px-4 py-3">JWT Authentication</td>
                    <td className="px-4 py-3">Session (30 days)</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">userId</td>
                    <td className="px-4 py-3">User identification</td>
                                   <tr className="border-t">
                    <td className="px-4 py-3 font-mono text-xs">userId</td>
                    <td className="px-4 py-3">User identification</td>
                    <td className="px-4 py-3">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              <strong>No tracking cookies.</strong> No Google Analytics, no ads, no behavioral tracking.
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
            <h4 className="font-bold text-lg text-gray-900 mb-3">⚠️ Browser Storage</h4>
            <p className="text-sm text-gray-700">
              We use <code className="font-mono bg-orange-100 px-1.5 py-0.5 rounded text-xs">localStorage</code> for:
            </p>
            <ul className="mt-3 space-y-2 text-sm list-disc list-inside text-gray-700">
              <li>Authentication tokens (JWT)</li>
              <li>User ID for session persistence</li>
              <li>UI preferences (dark mode, etc.)</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: '6',
      title: 'Data Retention & Deletion',
 //     icon: LockClosedIcon,
      content: `
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-8 rounded-3xl border border-slate-200 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl mb-4">
                🗑️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You Own Your Data</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Delete anytime. No questions asked. Data gone forever.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all">
                  <h5 className="font-semibold text-gray-900 mb-2">Project Deletion</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Immediate permanent deletion</li>
                    <li>• All bugs, members, history removed</li>
                    <li>• No recovery possible</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all">
                  <h5 className="font-semibold text-gray-900 mb-2">Account Deletion</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Contact support@qaflow.com</li>
                    <li>• 30-day grace period</li>
                    <li>• Complete data purge</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: '7',
      title: 'Changes to This Policy',
  //    icon: ShieldCheckIcon,
      content: `
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-200">
          <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">📋 We'll Always Tell You</h4>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border">
              <h5 className="font-semibold text-lg text-gray-900 mb-3">How We'll Notify You</h5>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-emerald-50 rounded-xl border">
                  <div className="font-bold text-emerald-900 mb-1">✅ In-App Banner</div>
                  <p className="text-emerald-800 text-xs">Visible on login</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border">
                  <div className="font-bold text-blue-900 mb-1">📧 Email</div>
                  <p className="text-blue-800 text-xs">Sent to project owners</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border">
                  <div className="font-bold text-purple-900 mb-1">📱 Continued Use</div>
                  <p className="text-purple-800 text-xs">Accepted by continued use</p>
                </div>
              </div>
            </div>
            
            <div className="text-center pt-6 border-t border-amber-200">
              <p className="text-sm text-gray-600 mb-4">
                Last updated: <strong>December 15, 2024</strong>
              </p>
              <p className="text-xs text-gray-500">
                Questions? <a href="mailto:privacy@yourapp.com" className="text-blue-600 hover:text-blue-700 font-medium underline">privacy@yourapp.com</a>
              </p>
            </div>
          </div>
        </div>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl border border-white/50 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              🔒
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent leading-tight">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-600 mt-2 max-w-2xl mx-auto">
                Your data. Your projects. Our commitment to privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`group bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 rounded-3xl p-8 hover:-translate-y-2 ${
                activeSection === section.id ? 'ring-4 ring-blue-500/20 shadow-blue-500/25' : ''
              }`}
            >
              {/* Section Header */}
              <div 
                className="flex items-center gap-4 mb-6 cursor-pointer group-hover:text-blue-700 transition-colors"
                onClick={() => setActiveSection(section.id)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                {/* //  <section.icon className="w-6 h-6" /> */}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Section {section.id}</p>
                </div>
              </div>

              {/* Section Content */}
              <div 
                className={`overflow-hidden transition-all duration-700 ${
                  activeSection === section.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
       <Contactus/>
      </div>
    </div>
  );
}