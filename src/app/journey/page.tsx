import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SceneBoot from '@/components/SceneBoot';
import JourneyStory from '@/components/journey/JourneyStory';
import '@/styles/journey.css';

export const metadata: Metadata = {
  title: 'The journey',
  description: 'From our factory to your pad: one finished container, loaded, shipped and set down once.',
};

export default function JourneyPage() {
  return (
    <div className="journey">
      <SiteHeader active="journey" sheet="Film 00 - Factory" sheetId="sheet" prod="Data center module - 16.35 × 3.20 × 3.20 m" />
      <JourneyStory />
      <img className="logo-light" src="/assets/logo-light.png" alt="" hidden />
      <img className="logo-dark" src="/assets/logo-dark.svg" alt="" hidden />
      <SceneBoot scene="journey" />
    </div>
  );
}
