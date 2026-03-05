'use client';

import React, { useState } from 'react';
//import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Sara Smith',
    role: 'Frontend Developer',
    photo: 'https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    socials: [
      { name: 'LinkedIn', link: '#', icon:' <FaLinkedin /> '},
      { name: 'Twitter', link: '#', icon: '<FaTwitter />' },
      { name: 'GitHub', link: '#', icon: '<FaGithub />' },
    ],
  },
  {
    name: 'Jane Doe',
    role: 'Backend Developer',
    photo: 'https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    socials: [
      { name: 'LinkedIn', link: '#', icon: '<FaLinkedin />' },
      { name: 'GitHub', link: '#', icon: '<FaGithub />' },
    ],
  },
  {
    name: 'Michael Brown',
    role: 'QA Engineer',
    photo: 'https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    socials: [
      { name: 'LinkedIn', link: '#', icon: '<FaLinkedin />' },
      { name: 'Twitter', link: '#', icon:' <FaTwitter />' },
    ],
  },
];

const values = [
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Innovation',
    description: 'QAFlow leverages cutting-edge automation and analytics to streamline your testing workflow.',
    color: 'from-blue-500 to-cyan-500',
  },
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Collaboration',
    description: 'Connect QA teams seamlessly to improve project visibility and efficiency.',
    color: 'from-purple-500 to-pink-500',
  },
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Efficiency',
    description: 'Track bugs, prioritize tasks, and close issues faster than ever.',
    color: 'from-green-500 to-emerald-500',
  },
];

const stats = [
  { value: '500+', label: 'Projects Managed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50+', label: 'Team Members' },
  { value: '24/7', label: 'Support' },
];

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
     <section className="py-24 px-6 relative z-10 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
  <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
    
    {/* Left Content */}
    <div className="flex-1 text-center lg:text-left">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-sm mb-6">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-sm font-medium text-indigo-700">About QAFlow</span>
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Accelerate Your{' '}
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          QA Workflow
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8 leading-relaxed">
        QAFlow empowers teams to catch bugs faster, collaborate seamlessly, and deliver flawless software. 
        Experience real-time insights and smart automation for all your QA needs.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <a
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Get Started
        </a>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Us
        </a>
      </div>
    </div>

    {/* Right Hero Image / Illustration */}
    <div className="flex-1 relative">
      <img 
        src="https://datafloq.com/wp-content/uploads/2021/12/blog_pictures2FQuality_Assurance_Testing_8xXpzGg.jpg" 
        alt="QA Dashboard Illustration" 
        className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
      />
      {/* Optional floating elements */}
      <div className="absolute -top-8 -left-8 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500"></div>
    </div>
  </div>
</section>

      {/* Stats Section */}
  <section className="py-12 px-6 relative z-10">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Feature Cards */}
      {[
        { title: 'Bug Tracking', description: 'Automated detection', iconColor: 'from-green-500 to-green-400', icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) },
        { title: 'Analytics', description: 'Real-time insights', iconColor: 'from-blue-500 to-blue-400', icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ) },
        { title: 'Team Collaboration', description: 'Work together', iconColor: 'from-purple-500 to-pink-500', icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ) },
      ].map((feature, index) => (
        <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.iconColor} flex items-center justify-center text-white shadow-lg`}>
            {feature.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
      {/* Mission & Vision Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to transforming how teams approach quality assurance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide an intuitive QA dashboard that makes bug tracking and project monitoring simple, 
                efficient, and beautiful for teams of all sizes.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the world's most trusted QA management platform, empowering teams to deliver 
                flawless software experiences through intelligent automation and collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The principles that guide our work and drive QA excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((item) => (
            <div 
              key={item.title} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transition-all duration-300 transform              hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet the Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The talented individuals behind QAFlow
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
              {/* Circular Photo */}
              <div className="relative w-40 h-40 mx-auto mt-6 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-full"></div>
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{member.role}</p>

                {/* Social Links */}
                <div className="flex justify-center gap-3">
                  {member.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 md:p-12 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full filter blur-3xl"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Team</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              We're always looking for talented developers to help us improve the QA experience.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}