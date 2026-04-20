import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import SafetyCheckIcon from '@mui/icons-material/Security';
import PrepIcon from '@mui/icons-material/Assignment';
import ConstructionIcon from '@mui/icons-material/Construction';

const TREATMENTS: Record<string, {
  title: string;
  subtitle: string;
  overview: string;
  threat: string;
  protocol: { title: string; desc: string }[];
  prep: string[];
  safety: string;
  serviceSlug: string;
  serviceTitle: string;
  image: string;
}> = {
  'duck-ants': {
    title: 'Duck Ant (Arboreal Termite) Treatment',
    subtitle: 'High-precision elimination of arboreal colony structures.',
    image: '/images/service-detail-termite.png',
    overview: 'Duck ants, or arboreal termites, are infamous in Jamaica for their visible dark nests in trees and mud tubes on building exteriors. They move with incredible speed from their nest to your home\'s structural wood.',
    threat: 'High-speed structural damage. Their nests can house hundreds of thousands of termites, creating multiple entry points into a single building.',
    protocol: [
      { title: 'Nest Injection', desc: 'Direct mechanical liquidation of the arboreal nest using non-repellent chemical agents.' },
      { title: 'Structural Barrier', desc: 'Installation of a high-load residual barrier on all mud track paths identified during the survey.' },
      { title: 'Attic Dusting', desc: 'Strategic application of insecticidal dust into internal wood voids where they feed.' },
    ],
    prep: [
      'Trim all tree branches touching the structure.',
      'Remove stacked lumber or dead wood from the yard.',
      'Ensure access to all ceiling manholes.',
    ],
    safety: 'Vacate during treatment. Safe re-entry after 2 hours. Ventilate the space for 15 minutes upon return.',
    serviceSlug: 'termite-control',
    serviceTitle: 'Professional Termite Control',
  },
  'german-cockroach': {
    title: 'German Cockroach Intensive Protocol',
    subtitle: 'The "Kitchen Destroyer" elimination strategy.',
    image: '/images/service-detail-roach.png',
    overview: 'The German Cockroach is the most prolific pest in commercial and residential kitchens. They carry bacteria like Salmonella and E. coli and breed exponentially.',
    threat: 'High disease transmission risk and asthma triggers. One female can lead to 30,000 descendants in a single year.',
    protocol: [
      { title: 'Precision Baiting', desc: 'Deployment of high-palatability gel baits in hinges, cracks, and motor housings.' },
      { title: 'IGR Deployment', desc: 'Use of Insect Growth Regulators to break the reproductive cycle of surviving adults.' },
      { title: 'Flush Treatment', desc: 'Targeted void injection to force populations out of hidden harborages into bait zones.' },
    ],
    prep: [
      'Empty all kitchen cabinets and drawers.',
      'Wipe down all food debris from counters and floor.',
      'Store all open food in airtight containers.',
    ],
    safety: 'Pets must be removed during treatment. Safe for food areas once the treatment has dried (approx. 1 hour).',
    serviceSlug: 'roach-control',
    serviceTitle: 'Professional Roach Control',
  },
  'subterranean-termite': {
    title: 'Subterranean Termite Soil Barrier',
    subtitle: 'Ground-up protection for your foundation.',
    image: '/images/service-detail-termite.png',
    overview: 'Unlike Duck Ants, these termites live in the soil. They attack your home from the foundation up, often through tiny cracks in the concrete or plumbing penetrations.',
    threat: 'Invisible destruction. Often only found when floorboards fail or doorframes lose structural integrity.',
    protocol: [
      { title: 'Soil Injection', desc: 'Creation of a continuous chemical zone in the soil around the foundation perimeter.' },
      { title: 'Slab Treatment', desc: 'Sub-slab injection via strategic drilling in areas where foundations meet internal walls.' },
      { title: 'Monitoring Grid', desc: 'Installation of in-ground monitoring stations to intercept new colonies before they reach the building.' },
    ],
    prep: [
      'Clear any mulch or soil that is touching the external siding.',
      'Ensure clear path (2ft) around the external foundation.',
      'Identify the location of underground utility lines if possible.',
    ],
    safety: 'External soil treatment is low-risk for occupants. Internal slab injection requires vacating for 4 hours.',
    serviceSlug: 'termite-control',
    serviceTitle: 'Professional Termite Control',
  },
  'norway-rat': {
    title: 'Norway Rat Exclusion & Control',
    subtitle: 'Strategic population management and structural sealing.',
    image: '/images/service-detail-rodent.png',
    overview: 'Norway rats are burrowers and expert climbers. They enter structures through gaps as small as a quarter and cause significant damage to electrical wiring.',
    threat: 'Fire hazard due to chewed wires. Transmission of Leptospirosis and other severe pathogens.',
    protocol: [
      { title: 'Entry Exclusion', desc: 'Permanent sealing of all gaps using steel wool, heavy-duty mesh, and industrial sealant.' },
      { title: 'Strategic Baiting', desc: 'Placement of tamper-resistant exterior bait stations far from child/pet zones.' },
      { title: 'Tracking Powder', desc: 'Use of non-toxic tracking media to identify secret runways for precision trap placement.' },
    ],
    prep: [
      'Clear all clutter from garages/attics.',
      'Seal all trash bins with tight lids.',
      'Eliminate any standing water or leaky pipes.',
    ],
    safety: 'Bait stations are locked and secured. Do not touch or move stations. Safe for occupants immediately.',
    serviceSlug: 'rodent-removal',
    serviceTitle: 'Professional Rodent Removal',
  },
  'aedes-aegypti': {
    title: 'Aedes Aegypti Mosquito Mitigation',
    subtitle: 'Reducing the local threat of Dengue and Zika.',
    image: '/images/service-detail-mosquito.png',
    overview: 'This specific mosquito breeds in clean, stagnant water around the home and bites primarily during the day. It is the primary vector for Dengue fever in the Caribbean.',
    threat: 'Severe public health risk. Daytime biting patterns make standard "night fogging" less effective.',
    protocol: [
      { title: 'Source Reduction', desc: 'Detailed property sweep to eliminate all micro-breeding sites (potted plants, gutters, etc.).' },
      { title: 'Larviciding', desc: 'Treatment of unremovable water with biological larvicides that target larvae without harming pets.' },
      { title: 'Residual Mist', desc: 'Application of a long-lasting mist to the underside of vegetation where adults rest.' },
    ],
    prep: [
      'Empty all vases and containers of standing water.',
      'Remove all toys and items from the lawn.',
      'Close all windows if ULV fogging is scheduled.',
    ],
    safety: 'Stay indoors during mist application. Safe to return to the yard after 30 minutes. Do not spray near fish ponds.',
    serviceSlug: 'mosquito-control',
    serviceTitle: 'Professional Mosquito Control',
  },
  'common-bed-bug': {
    title: 'Bed Bug Thermal & Chemical Flush',
    subtitle: 'Total elimination of all life stages, including eggs.',
    image: '/images/service-detail-bedbug.png',
    overview: 'Bed bugs are resilient pests that hide in mattress seams and bed frames. They are nocturnal and feed on human blood during sleep.',
    threat: 'Severe sleep disruption and allergic reactions. Infestations are easily spread to other rooms or neighbors.',
    protocol: [
      { title: 'Enclosure Steaming', desc: 'High-temperature steam treatment of mattresses and upholstery to kill eggs on contact.' },
      { title: 'Chemical Injection', desc: 'Injection of residual pesticides into bed frames, baseboards, and wall voids.' },
      { title: 'Monitoring Traps', desc: 'Installation of passive interceptors to verify total elimination over a 14-day window.' },
    ],
    prep: [
      'Wash all bedding and clothes in hot water (60°C).',
      'Vacuum all floors and furniture thoroughly.',
      'Move beds at least 2 feet away from the walls.',
    ],
    safety: 'Vacate for 4–6 hours. Safe for re-entry once the room is dry. Do not apply own chemicals between visits.',
    serviceSlug: 'bed-bug-treatment',
    serviceTitle: 'Professional Bed Bug Treatment',
  },
  'pharaoh-ant': {
    title: 'Pharaoh Ant Baiting Protocol',
    subtitle: 'Strategic "Anti-Budding" elimination strategy.',
    image: '/images/service-detail-general.png',
    overview: 'Pharaoh ants are tiny and yellow. They are uniquely dangerous because spraying them causes the colony to split (budding) into new nests.',
    threat: 'Extremely difficult to eliminate once they split. They can navigate electrical wiring and plumbing to reach any room.',
    protocol: [
      { title: 'Protein Baiting', desc: 'Deployment of specialized slow-acting protein baits that the ants carry back to the queen.' },
      { title: 'Sugar-Based Rotation', desc: 'Switching to carbohydrate baits to ensure the entire colony is reached regardless of diet phase.' },
      { title: 'Path Tracing', desc: 'Mapping of ant trails to place baits directly in their foraging routes.' },
    ],
    prep: [
      'DO NOT use any grocery-store sprays or aerosols.',
      'Wipe down trails with soapy water ONLY after tech arrives.',
      'Seal all sweet foods and grease sources.',
    ],
    safety: 'Safe to remain in the home during treatment. Baits are enclosed and low-toxicity. Keep kids away from bait dots.',
    serviceSlug: 'general-pest-control',
    serviceTitle: 'General Pest Control Service',
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const treatment = TREATMENTS[slug];
  if (!treatment) return { title: 'Treatment Not Found' };
  return {
    title: `${treatment.title} | Final Entry`,
    description: treatment.subtitle,
  };
}

export async function generateStaticParams() {
  return Object.keys(TREATMENTS).map((slug) => ({ slug }));
}

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params;
  const t = TREATMENTS[slug];
  if (!t) notFound();

  return (
    <Box component="main" sx={{ pt: '100px', minHeight: '100vh', bgcolor: tokens.obsidian, color: tokens.chalk }}>
      {/* Breadcrumb / Back */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Link href="/pest-library" passHref style={{ textDecoration: 'none' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            sx={{ color: 'rgba(246,243,236,0.5)', '&:hover': { color: tokens.citrus } }}
          >
            Back to Pest Library
          </Button>
        </Link>
      </Container>

      {/* Hero Section */}
      <Box sx={{ bgcolor: tokens.surfaceDark, borderY: `1px solid ${tokens.border}`, py: { xs: 6, md: 10 }, mb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.2em', mb: 1, display: 'block' }}>
                PROFESSIONAL PROTOCOL
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 3, lineHeight: 1.1 }}>
                {t.title}
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', color: 'rgba(246,243,236,0.7)', mb: 4, maxWidth: '600px', lineHeight: 1.6 }}>
                {t.overview}
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'rgba(198,241,53,0.05)', 
                  border: `1px solid ${tokens.citrus}`, 
                  borderRadius: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start'
                }}
              >
                <InfoIcon sx={{ color: tokens.citrus, mt: 0.3 }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, color: tokens.citrus, mb: 0.5 }}>The Threat</Typography>
                  <Typography sx={{ color: 'rgba(246,243,236,0.8)', fontSize: '0.95rem' }}>{t.threat}</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box 
                sx={{ 
                  width: '100%', 
                  aspectRatio: '1/1', 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  border: `1px solid ${tokens.border}`,
                  boxShadow: '0 20px 80px rgba(0,0,0,0.4)'
                }}
              >
                <Box 
                  component="img" 
                  src={t.image} 
                  alt={t.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content Sections */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={4}>
          {/* Protocol Steps */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h3" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ConstructionIcon sx={{ color: tokens.citrus }} />
              Treatment Protocol
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {t.protocol.map((step, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 3 }}>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: tokens.citrus, opacity: 0.2, lineHeight: 1, minWidth: '40px' }}>
                    0{i+1}
                  </Typography>
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{step.title}</Typography>
                    <Typography sx={{ color: 'rgba(246,243,236,0.6)', lineHeight: 1.7 }}>{step.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Sidebar: Prep & Safety */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Prep Card */}
              <Paper sx={{ p: 4, bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.border}`, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PrepIcon sx={{ color: tokens.citrus }} />
                  Preparation Required
                </Typography>
                <List sx={{ p: 0 }}>
                  {t.prep.map((item, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tokens.citrus }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        slotProps={{ primary: { sx: { color: 'rgba(246,243,236,0.7)', fontSize: '0.9rem' } } }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Safety Card */}
              <Paper sx={{ p: 4, bgcolor: tokens.surfaceMid, border: `1px solid ${tokens.border}`, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SafetyCheckIcon sx={{ color: tokens.citrus }} />
                  Safety & Re-entry
                </Typography>
                <Typography sx={{ color: 'rgba(246,243,236,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {t.safety}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Other Treatments Grid */}
        <Box sx={{ mt: 12 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Explore Other Protocols</Typography>
          <Grid container spacing={2}>
            {Object.entries(TREATMENTS)
              .filter(([key]) => key !== slug)
              .map(([key, item]) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                  <Link href={`/treatments/${key}`} style={{ textDecoration: 'none' }}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        bgcolor: tokens.surfaceMid, 
                        border: `1px solid ${tokens.border}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: tokens.citrus,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5, color: tokens.chalk }}>{item.title}</Typography>
                      <Typography sx={{ color: 'rgba(246,243,236,0.5)', fontSize: '0.8rem' }}>View Technical Protocol →</Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
          </Grid>
        </Box>

        {/* Action Bridge */}
        <Box 
          sx={{ 
            mt: 12, 
            p: { xs: 4, md: 8 }, 
            bgcolor: tokens.surfaceMid, 
            border: `1px solid ${tokens.citrus}`, 
            borderRadius: 4, 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" sx={{ mb: 3, fontSize: { xs: '2rem', md: '3.5rem' } }}>
              Ready for Professional Intervention?
            </Typography>
            <Typography sx={{ color: 'rgba(246,243,236,0.5)', mb: 6, maxWidth: '600px', mx: 'auto', fontSize: '1.1rem' }}>
              We don&apos;t just manage pests; we eliminate them using these world-class industrial protocols.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/services/${t.serviceSlug}`} passHref style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    bgcolor: tokens.citrus, 
                    color: tokens.obsidian, 
                    fontWeight: 700, 
                    px: 6, 
                    py: 2,
                    '&:hover': { bgcolor: '#b5e02d' }
                  }}
                >
                  View {t.serviceTitle}
                </Button>
              </Link>
              <Link href="/booking" passHref style={{ textDecoration: 'none' }}>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    color: tokens.citrus, 
                    borderColor: tokens.citrus, 
                    fontWeight: 700, 
                    px: 6, 
                    py: 2,
                    '&:hover': { borderColor: '#b5e02d', bgcolor: 'rgba(198,241,53,0.05)' }
                  }}
                >
                  Request Fast Quote
                </Button>
              </Link>
            </Box>
          </Box>
          <Typography 
            sx={{ 
              position: 'absolute', 
              top: -50, 
              right: -50, 
              fontSize: '20rem', 
              color: 'rgba(198,241,53,0.03)', 
              fontWeight: 900,
              pointerEvents: 'none',
              lineHeight: 1
            }}
          >
            ACTION
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
