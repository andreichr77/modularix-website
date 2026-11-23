import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SceneBoot from '@/components/SceneBoot';
import HomeStage from '@/components/home/HomeStage';
import HomeStory from '@/components/home/HomeStory';
import Why from '@/components/home/Why';
import Configs from '@/components/home/Configs';
import SiteInterface from '@/components/home/Site';
import JourneySection from '@/components/home/JourneySection';
import Scale from '@/components/home/Scale';
import Proof from '@/components/home/Proof';
import Contact from '@/components/home/Contact';
import '@/styles/home.css';

export const metadata: Metadata = {
  title: { absolute: 'Modularix - Prefabricated modular data centers' },
};

export default function Home() {
  return (
    <div className="home">
      <HomeStage />
      <SiteHeader
        active="module"
        sheet="Sheet 00 - Cover"
        sheetId="sheet"
        prod="Legacy container - 8.50 × 3.20 × 3.20 m"
        prodId="prod"
      />
      <HomeStory />
      <div id="after">
        <Why />
        <Configs />
        <SiteInterface />
        <JourneySection />
        <Scale />
        <Proof />
        <Contact />
        <SiteFooter />
      </div>
      {/* Textures for the 3D container's logo (read by the scene) */}
      <img className="logo-light" src="/assets/logo-light.png" alt="" hidden />
      <img className="logo-dark" src="/assets/logo-dark.svg" alt="" hidden />
      <SceneBoot scene="home" />
    </div>
  );
}
