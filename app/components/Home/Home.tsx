'use client';

import React from "react";
 
import HomeHero from "./Home-hero";
import HomeCard from "./Home-cards";
import CardsHeader from "./Cards-header";
 

export default function Home() {
 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex flex-col">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
     
<HomeHero />
      {/* Header Section */}
 
<CardsHeader/>
      {/* Action Cards */}
     <HomeCard/>
   
   
    </div>
  );
}