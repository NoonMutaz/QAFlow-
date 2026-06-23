'use client';

import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Disable SSR so the canvas doesn't glitch during Next.js hydration
const Lightfall = dynamic(() => import('../Lightfall'), { ssr: false });

const LIGHTFALL_COLORS = ['#A6C8FF', '#5227FF', '#FF9FFC'];

export default function HomeHero() {
  const router = useRouter();
  
  const handleCreateProject = () => {
    router.push("/createProject");
  };

  return (
    <div>
      {/* CRITICAL: 'isolate' forces the -z-10 canvas to stay inside this section */}
      {/* instead of falling behind the main page's white/purple gradient background */}
      <section className="relative isolate overflow-hidden py-20 px-6">
        
        {/* Background */}
        <div className="absolute inset-0 z-0">
<div style={{ width: '100%', height: 600, position: 'relative' }}>
<Lightfall
  colors={[ '#5227FF', '#FF9FFC', '#B497CF' ]}
  mouseForce={28}
  cursorSize={40}
  isViscous
  viscous={37}
  iterationsViscous={34}
  iterationsPoisson={20}
  resolution={0.5}
  isBounce={false}
  autoDemo
  autoSpeed={0.6}
  autoIntensity={2.2}
  takeoverDuration={0.25}
  autoResumeDelay={3000}
  autoRampDuration={0.6}
/>
</div>
      </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-sm mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary-700">Welcome to QAFlow</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Building the Future of{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              QA Excellence
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Our mission is to provide an intuitive QA dashboard for software teams, making bug tracking and project monitoring simple, efficient, and beautiful.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-primary-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              Get Started
            </button>
            <a
              href="/aboutUs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}