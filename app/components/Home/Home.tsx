'use client';

import React from "react";

import HomeHero from "./Home-hero";
import HomeCard from "./Home-cards";
import CardsHeader from "./Cards-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-slate-100 flex flex-col relative overflow-hidden">
      
      {/* Decorative Background Elements (Imtithal / Compliance Theme) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Emerald glow for compliance & approval status */}
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full filter blur-[120px] opacity-40 animate-pulse"></div>
        {/* Deep Slate/Indigo subtle glow for security */}
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-600/15 rounded-full filter blur-[100px] opacity-30 animate-pulse delay-1000"></div>
        {/* Amber/Gold accent for audit & quality benchmarks */}
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] bg-amber-500/10 rounded-full filter blur-[120px] opacity-30 animate-pulse delay-2000"></div>
      </div>

      {/* Main Content Wrapper */}
      <main className="relative z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <HomeHero />

        {/* Header Section */}
        <CardsHeader />

        {/* Action Cards Grid */}
        <HomeCard />
      </main>

    </div>
  );
}