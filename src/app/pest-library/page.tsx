import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pest Library',
  description: 'Identify common pests in Jamaica. Learn about cockroaches, termites, rodents, mosquitoes, bed bugs, and more — how to spot them and how to eliminate them.',
};

const PESTS = [
  {
    slug: 'duck-ants',
    name: 'Duck Ants (Termites)',
    scientific: 'Nasutitermes costalis',
    danger: 'Severe',
    emoji: '🪵',
    description: 'The common Jamaican name for destructive termites. These insects build large, conspicuous arboreal nests and mud tunnels to access structural wood. They are the leading cause of structural damage in Jamaican homes.',
    signs: ['Conspicuous brown mud nests in trees or on buildings', 'Hard mud-like "tracks" or tunnels on walls', 'Small, creamy-white insects found within wood', 'Hollow-sounding or sagging structural timber'],
    treatment: 'termite-control',
  },
  {
    slug: 'german-cockroach',
    name: 'German Cockroach',
    scientific: 'Blattella germanica',
    danger: 'High',
    emoji: '🪳',
    description: 'The most common cockroach in Jamaican homes and restaurants. Prolific breeders with one female producing up to 40,000 offspring per year. A key driver of asthma in urban areas.',
    signs: ['Droppings that look like black pepper', 'Musty odour in kitchen cabinets', 'Egg cases (oothecae) in crevices', 'Nocturnal sightings near food sources'],
    treatment: 'roach-control',
  },
  {
    slug: 'subterranean-termite',
    name: 'Subterranean Termite',
    scientific: 'Coptotermes formosanus',
    danger: 'Severe',
    emoji: '🪵',
    description: 'Jamaica\'s most destructive structural pest. Lives in underground colonies and travels through mud tubes to attack wood. Can consume a wooden beam in weeks.',
    signs: ['Mud tubes on foundation walls', 'Wings discarded near windowsills', 'Hollow-sounding wood', 'Bubbling paint on walls'],
    treatment: 'termite-control',
  },
  {
    slug: 'norway-rat',
    name: 'Norway Rat',
    scientific: 'Rattus norvegicus',
    danger: 'High',
    emoji: '🐀',
    description: 'Also called the brown rat or sewer rat. Gnaws through wiring causing fire hazards, and contaminates food with urine and faeces. Common in Jamaican drains and dumpsters.',
    signs: ['Droppings (capsule-shaped, 20mm)', 'Gnaw marks on cables and wood', 'Burrows near foundations', 'Greasy rub marks on walls'],
    treatment: 'rodent-removal',
  },
  {
    slug: 'aedes-aegypti',
    name: 'Aedes Aegypti Mosquito',
    scientific: 'Aedes aegypti',
    danger: 'Severe',
    emoji: '🦟',
    description: 'The primary vector of dengue, Zika, chikungunya, and yellow fever in Jamaica. Breeds in small amounts of standing water. Bites primarily during the day.',
    signs: ['Daytime biting activity', 'Stagnant water in containers', 'Black & white striped body', 'Bites on ankles and elbows'],
    treatment: 'mosquito-control',
  },
  {
    slug: 'common-bed-bug',
    name: 'Common Bed Bug',
    scientific: 'Cimex lectularius',
    danger: 'High',
    emoji: '🛏️',
    description: 'A resurgent pest in Jamaican hotels and homes. Feeds on human blood at night, causing itchy welts. Resistant to most over-the-counter treatments; spreads via luggage and furniture.',
    signs: ['Rusty blood stains on sheets', 'Dark faecal spots on mattresses', 'Itchy welts in rows or clusters', 'Shed skins in seams of mattress'],
    treatment: 'bed-bug-treatment',
  },
  {
    slug: 'pharaoh-ant',
    name: 'Pharaoh Ant',
    scientific: 'Monomorium pharaonis',
    danger: 'Moderate',
    emoji: '🐜',
    description: 'Tiny orange ants that infest homes, hospitals and kitchens. Can spread over 12 bacterial pathogens. Difficult to eliminate without professional bait treatments as DIY sprays cause colony "budding".',
    signs: ['Trails of tiny orange ants', 'Found near moisture (sinks, bathrooms)', 'Sudden appearance in large numbers', 'Visible near electrical outlets'],
    treatment: 'general-pest-control',
  },
];

const dangerColor: Record<string, string> = {
  Severe: '#E63946',
  High: '#F4A261',
  Moderate: '#E9C46A',
};

export default function PestLibraryPage() {
  return (
    <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian }}>
      {/* Hero */}
      <Box sx={{ py: { xs: 10, md: 14 }, px: { xs: 3, md: 6 }, maxWidth: '1200px', mx: 'auto', textAlign: 'center' }}>
        <Typography variant="overline" sx={{ color: tokens.citrus, letterSpacing: '0.14em', fontWeight: 700 }}>
          Know Your Enemy
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, mt: 1, mb: 3, lineHeight: 1 }}>
          Pest Library
        </Typography>
        <Typography sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '1.1rem', maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
          Identify the pests threatening your home or business. Click any pest to learn how to eliminate it.
        </Typography>
      </Box>

      {/* Grid */}
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          pb: { xs: 8, md: 14 },
          maxWidth: '1200px',
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3,
        }}
      >
        {PESTS.map((pest) => (
          <Link key={pest.slug} href={`/treatments/${pest.slug}`} passHref style={{ textDecoration: 'none', display: 'block' }}>
            <Box
              sx={{
                bgcolor: tokens.surfaceMid,
                border: `1px solid ${tokens.border}`,
                borderRadius: 1,
                p: 3,
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: tokens.citrus,
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 48px rgba(198,241,53,0.1)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>{pest.emoji}</Typography>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 0.5,
                    color: dangerColor[pest.danger],
                    bgcolor: `${dangerColor[pest.danger]}18`,
                    border: `1px solid ${dangerColor[pest.danger]}55`,
                  }}
                >
                  {pest.danger} Risk
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.4rem', mb: 0.5, color: tokens.chalk }}>
                {pest.name}
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.35)', fontSize: '0.75rem', fontStyle: 'italic', mb: 2 }}>
                {pest.scientific}
              </Typography>
              <Typography sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '0.88rem', lineHeight: 1.6, mb: 3 }}>
                {pest.description}
              </Typography>
              <Typography sx={{ color: tokens.citrus, fontSize: '0.8rem', fontWeight: 600 }}>
                View Treatment →
              </Typography>
            </Box>
          </Link>
        ))}
      </Box>

      {/* CTA */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: { xs: 8, md: 14 }, maxWidth: '1200px', mx: 'auto' }}>
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            bgcolor: tokens.surfaceMid,
            border: `1px solid ${tokens.citrus}`,
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 2 }}>
            Not Sure What You Have?
          </Typography>
          <Typography sx={{ color: 'rgba(246,243,236,0.6)', mb: 4, maxWidth: 480, mx: 'auto' }}>
            Our technicians will identify the pest, assess the severity, and recommend the right treatment — at no charge.
          </Typography>
          <Link href="/booking" passHref style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button
              variant="contained"
              size="large"
              id="pest-library-cta"
              sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, px: 5, py: 1.5 }}
            >
              Request a Free Inspection
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
