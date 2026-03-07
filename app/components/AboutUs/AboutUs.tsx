"use client";

import React, { useState } from "react";
import AboutUsHero from "./AbouUs-hero";
import AboutusValues from "./Aboutus-values";
import MissionVision from "./Mission&Vision";
import Stats from "./Stats";
import TeamSection from "./TeamSection";
import Contactus from "./Contactus";
//import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}

      <AboutUsHero />
      {/* Stats Section */}
      <Stats />
      {/* Mission & Vision Section */}
      <MissionVision />

      {/* Values Section */}

      <AboutusValues />
      {/* Team Section */}
      <TeamSection />
      {/* Call-to-Action Section */}
      <Contactus />
    </main>
  );
}
