'use client';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { JourneyMap } from '@/components/landing/JourneyMap';
import { NFTGallery } from '@/components/landing/NFTGallery';
import { GameSection } from '@/components/landing/GameSection';
import { EconomySection } from '@/components/landing/EconomySection';
import { ArchitectureSection } from '@/components/landing/ArchitectureSection';
import { SiteFooter } from '@/components/landing/SiteFooter';

export default function Home() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <HeroSection
        onPlay={() => {
          document.getElementById('jogar')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExplore={() => {
          document.getElementById('jornada')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <JourneyMap onPlay={() => document.getElementById('jogar')?.scrollIntoView({ behavior: 'smooth' })} />
      <NFTGallery />
      <GameSection />
      <EconomySection />
      <ArchitectureSection />
      <SiteFooter />
    </main>
  );
}
