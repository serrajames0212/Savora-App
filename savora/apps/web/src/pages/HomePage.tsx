import React from 'react';
import PageShell from '../components/layout/PageShell';
import HeroSection from '../components/home/HeroSection';
import GenomeCardsSection from '../components/home/GenomeCardsSection';
import MoodSection from '../components/home/MoodSection';
import DailyReflectionSection from '../components/home/DailyReflectionSection';
import SeasonalSection from '../components/home/SeasonalSection';
import JourneySection from '../components/home/JourneySection';
import MemoryHighlightSection from '../components/home/MemoryHighlightSection';
import DiscoveryPreviewSection from '../components/home/DiscoveryPreviewSection';

const SECTION_SPACING: React.CSSProperties = {
  paddingTop: 'var(--space-8)',
  paddingBottom: 'var(--space-8)',
};

const HomePage: React.FC = () => {
  return (
    <PageShell>
      <HeroSection />

      {/* Positive padding to account for hero card overlap */}
      <div style={{ paddingTop: 'calc(var(--space-8) + 28px)' }}>
        <div style={SECTION_SPACING}>
          <GenomeCardsSection />
        </div>

        <div style={SECTION_SPACING}>
          <MoodSection />
        </div>

        <div style={SECTION_SPACING}>
          <DailyReflectionSection />
        </div>

        <div style={SECTION_SPACING}>
          <SeasonalSection />
        </div>

        <div style={SECTION_SPACING}>
          <JourneySection />
        </div>

        <div style={SECTION_SPACING}>
          <MemoryHighlightSection />
        </div>

        <div style={SECTION_SPACING}>
          <DiscoveryPreviewSection />
        </div>
      </div>
    </PageShell>
  );
};

export default HomePage;
