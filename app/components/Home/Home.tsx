'use client';

import React from "react";

import HomeHero from "./Home-hero";
import { Audiences, Challenge, FactsStrip, FinalCta, Trust } from "./HomeStory";
import CardsHeader from "./Cards-header";
import AiCapabilities from "./AiCapabilities";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero: what Imtithal does, with a preview of the AI suggestion */}
      <HomeHero />

      {/* Key facts about the product */}
      <FactsStrip />

      {/* Why Imtithal: the problems on site today */}
      <Challenge />

      {/* Imtithal AI: what the AI does */}
      <AiCapabilities />

      {/* How it works: photo -> finding -> SBC clause -> verified closure */}
      <CardsHeader />

      {/* Who it's for */}
      <Audiences />

      {/* Why the AI can be trusted */}
      <Trust />

      {/* Closing call to action */}
      <FinalCta />
    </div>
  );
}
