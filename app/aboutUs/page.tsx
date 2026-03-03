'use client';

import React from 'react';
// import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Sara Smith',
    role: 'Frontend Developer',
    photo: 'https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    socials: [
      { name: 'LinkedIn', link: '#', icon:' ' },
      { name: 'Twitter', link: '#', icon: '<FaTwitter />' },
      { name: 'GitHub', link: '#', icon: '<FaGithub />' },
    ],
  },
  {
    name: 'Jane Doe',
    role: 'Backend Developer',
    photo: 'https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    socials: [
      { name: 'LinkedIn', link: '#', icon: '<FaLinkedin /> '},
      { name: 'GitHub', link: '#', icon: '<FaGithub />' },
    ],
  },
  {
    name: 'Michael Brown',
    role: 'QA Engineer',
    photo: 'https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    socials: [
      { name: 'LinkedIn', link: '#', icon:' <FaLinkedin /> '},
      { name: 'Twitter', link: '#', icon: '<FaTwitter /> '},
    ],
  },
];

const values = [
  { icon: '💡', title: 'Innovation', description: 'We continuously improve QA workflows with cutting-edge solutions.' },
  { icon: '🤝', title: 'Collaboration', description: 'Teamwork is at the core of what we do.' },
  { icon: '🚀', title: 'Efficiency', description: 'Optimizing bug tracking for speed and clarity.' },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Building the Future of{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QA Excellence
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Our mission is to provide an intuitive QA dashboard for software teams, making bug tracking and project monitoring simple, efficient, and beautiful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started
            </a>
            <a
              href="/features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
          {/* <img 
            src="https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3" 
            alt="Team illustration" 
            className="mx-auto mt-12 w-full max-w-2xl rounded-2xl shadow-2xl"
          /> */}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet the Team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The talented individuals behind ScholarAtlas
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <img src={member.photo} alt={member.name} className="w-full h-48 object-cover" />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-gray-500 mb-4">{member.role}</p>
                <div className="flex justify-center gap-3 text-gray-400 group-hover:text-gray-700 transition">
                  {member.socials.map((social) => (
                    <a key={social.name} href={social.link} className="text-lg">{social.icon}</a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">The principles that guide our work</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Team</h2>
        <p className="text-gray-700 mb-6">
          We’re always looking for talented developers to help us improve the QA experience.
        </p>
        <a
          href="/contact"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Contact Us
        </a>
      </section>
    </div>
  );
}