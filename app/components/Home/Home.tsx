'use client';

import React from "react";

import HomeHero from "./Home-hero";
import HomeCard from "./Home-cards";
import CardsHeader from "./Cards-header";
import AiCapabilities from "./AiCapabilities";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero: what Imtithal does, with a preview of the AI suggestion */}
      <HomeHero />

      {/* Imtithal AI: what the AI does */}
      <AiCapabilities />

      {/* How it works: photo -> finding -> SBC clause -> verified closure */}
      <CardsHeader />

      {/* Quick actions into the app */}
      <HomeCard />
    </div>
  );
}
