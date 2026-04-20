import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { tokens } from '@/lib/theme';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SERVICES: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  process: { step: string; title: string; desc: string }[];
  tag?: string;
  emoji: string;
  image: string;
  faqs: { q: string; a: string }[];
}> = {
  'fumigation': {
    title: 'Fumigation',
    subtitle: 'Precision high-level area sterilization and sterilization protocols.',
    emoji: '💨',
    tag: 'Most Requested',
    image: '/images/service-detail-fumigation.png',
    description:
      'Professional area sterilization is essential for high-risk environments like commercial kitchens, storage facilities, and residential spaces. Our protocols use advanced aerosolized technology to ensure total sterilization of all surfaces and air volumes.',
    details: [
      'Comprehensive biological risk assessment',
      'Advanced ULV fogging and aerosolized treatment',
      'Area isolation and sealing protocols',
      'Post-treatment air quality verification',
      'Detailed sterilization certificate provided',
      'Safe re-entry protocols for all occupants',
    ],
    process: [
      { step: '01', title: 'Assessment', desc: 'Identify high-touch surfaces and risk factors within the service area.' },
      { step: '02', title: 'Preparation', desc: 'Isolate sensitive equipment and seal the ventilation system for treatment.' },
      { step: '03', title: 'Sterilization', desc: 'Apply aerosolized treatment using high-precision fogging units.' },
      { step: '04', title: 'Verification', desc: 'Monitor air quality and perform surface checks before clearing the area for re-entry.' },
    ],
    faqs: [
      { q: 'Is the treatment safe for electronics?', a: 'Yes. Our dry-fog technology is safe for sensitive electronic equipment when properly prepared.' },
      { q: 'How long must the area remain isolated?', a: 'Isolation typically lasts 2–4 hours depending on the volume and ventilation capacity.' },
      { q: 'Does it leave a residue?', a: 'Our hospital-grade sterilization agents decompose naturally without leaving toxic residues.' },
    ],
  },
  'termite-control': {
    title: 'Termite Control',
    subtitle: 'Targeted baiting systems that protect your structure long-term.',
    emoji: '🪵',
    image: '/images/service-detail-termite.png',
    description:
      'Termites cause billions in structural damage annually. In Jamaica, both subterranean and drywood forms are prevalent. We deploy a combination of liquid termiticide barriers and above-ground bait stations for comprehensive, lasting protection.',
    details: [
      'Full structural inspection with termite activity mapping',
      'Termidor® liquid termiticide soil treatment',
      'Sentricon® or equivalent baiting station installation',
      'Annual monitoring contract available',
      'Structural damage assessment report',
      'Pre-construction treatment also available',
    ],
    process: [
      { step: '01', title: 'Inspection', desc: 'We probe, tap, and inspect your entire structure for active termite galleries and entry points.' },
      { step: '02', title: 'Liquid Treatment', desc: 'Termiticide injected into the soil around your foundation to create a chemical barrier.' },
      { step: '03', title: 'Bait Stations', desc: 'Monitoring and bait stations installed at intervals around the perimeter.' },
      { step: '04', title: 'Annual Review', desc: 'Yearly inspections to confirm colony elimination and monitor new activity.' },
    ],
    faqs: [
      { q: 'How quickly do treatments work?', a: 'Bait stations suppress a colony within 30–90 days. Liquid barriers provide immediate protective zones.' },
      { q: 'Do I need to move furniture?', a: 'No. Interior treatment is typically not required. Treatment focuses on the soil perimeter and foundation.' },
      { q: 'How long does the protection last?', a: 'Liquid treatments remain effective for 5–10 years. Bait stations require annual monitoring.' },
    ],
  },
  'rodent-removal': {
    title: 'Rodent Removal',
    subtitle: 'Rats and mice eliminated. Entry points sealed. Done.',
    emoji: '🐀',
    image: '/images/service-detail-rodent.png',
    description:
      'Rodents carry over 35 diseases and can cause devastating structural damage to wiring and plumbing. Our rodent exclusion program combines population control with permanent entry-point sealing to ensure they can\'t come back.',
    details: [
      'Full exterior and interior inspection',
      'Snap and live trap strategic placement',
      'Rodenticide bait stations (exterior)',
      'Entry point exclusion with steel mesh & caulk',
      'Sanitation and harborage reduction guidance',
      'Ongoing monitoring program available',
    ],
    process: [
      { step: '01', title: 'Inspection', desc: 'We map droppings, runways, gnaw marks, and all potential entry points.' },
      { step: '02', title: 'Trapping', desc: 'Traps and bait stations placed at all high-activity zones.' },
      { step: '03', title: 'Exclusion', desc: 'All entry points sealed with professional-grade materials resistant to gnawing.' },
      { step: '04', title: 'Monitoring', desc: 'Follow-up visits to clear traps and confirm population is eliminated.' },
    ],
    faqs: [
      { q: 'How long does removal take?', a: 'Most infestations are resolved within 2–3 weeks with proper trap placement and exclusion.' },
      { q: 'Is rodenticide safe around children?', a: 'Exterior bait stations are tamper-resistant and inaccessible to children. We use second-generation anticoagulants only where necessary.' },
      { q: 'What if rodents return?', a: 'If entry points are sealed properly, re-infestation is very unlikely. We offer a free re-service guarantee.' },
    ],
  },
  'mosquito-control': {
    title: 'Mosquito Control',
    subtitle: 'Reduce dengue and Zika risk with targeted outdoor treatment.',
    emoji: '🦟',
    tag: 'High Priority JM',
    image: '/images/service-detail-mosquito.png',
    description:
      'Mosquito-borne illnesses like dengue, Zika, and chikungunya are serious health threats in Jamaica. Our control program combines source reduction, larviciding, and adulticide fogging to provide meaningful protection around your home or business.',
    details: [
      'Property assessment: standing water & breeding site identification',
      'Larviciding of all water bodies (gutters, drums, tyres)',
      'ULV adulticide fogging of vegetation',
      'Mosquito misting system installation (optional)',
      'Seasonal contract programs available',
      'Environmentally responsible products used',
    ],
    process: [
      { step: '01', title: 'Assessment', desc: 'We identify all potential breeding sites across your property.' },
      { step: '02', title: 'Source Reduction', desc: 'Standing water eliminated or treated with mosquito dunk larvicide.' },
      { step: '03', title: 'Fogging', desc: 'ULV adulticide applied to vegetation and resting sites at dusk.' },
      { step: '04', title: 'Follow-up', desc: 'Scheduled return visits to re-treat and monitor effectiveness.' },
    ],
    faqs: [
      { q: 'How safe is the fogging treatment?', a: 'We use EPA-registered products. We ask that you remain inside during treatment and for 30 minutes after.' },
      { q: 'How often should treatment occur?', a: 'For maximum protection during peak season (May–October), monthly treatments are recommended.' },
      { q: 'Does it work immediately?', a: 'Adulticide treatments reduce adult populations within 24 hours. Full seasonal control builds over multiple treatments.' },
    ],
  },
  'bed-bug-treatment': {
    title: 'Bed Bug Treatment',
    subtitle: 'Heat and chemical treatments. We don\'t leave until they\'re gone.',
    emoji: '🛏️',
    image: '/images/service-detail-bedbug.png',
    description:
      'Bed bugs are expert hitchhikers and one of the most difficult pests to eliminate. Our protocol uses a combination of heat treatment and targeted residual chemicals to destroy all life stages — eggs included — with a guaranteed re-treatment policy.',
    details: [
      'Full bedroom and adjacent room inspection',
      'Thermal heat treatment (57°C kills all life stages)',
      'Targeted residual chemical treatment',
      'Mattress and box spring encasements supplied',
      'Post-treatment monitoring traps',
      'Free re-treatment guarantee within 60 days',
    ],
    process: [
      { step: '01', title: 'Inspection', desc: 'Thorough inspection with a torch and probe — seams, frames, outlet covers, all checked.' },
      { step: '02', title: 'Preparation', desc: 'We guide you through simple preparation steps to maximize treatment effectiveness.' },
      { step: '03', title: 'Treatment', desc: 'Heat treatment or chemical protocol applied room by room with precision.' },
      { step: '04', title: 'Monitoring', desc: 'Interceptor traps placed under furniture legs to monitor for any surviving activity.' },
    ],
    faqs: [
      { q: 'Do I need to throw away my mattress?', a: 'Rarely. In most cases, a mattress encasement seals surviving bugs in and protects against future infestation.' },
      { q: 'How long do I need to be out of the room?', a: 'For heat treatment, you\'ll need to vacate for 6–8 hours. For chemical treatment, 4 hours minimum.' },
      { q: 'Why are bed bugs so hard to eliminate?', a: 'Their flat bodies let them hide in tiny crevices, and eggs are resistant to most pesticides. This is why we use heat as the primary treatment.' },
    ],
  },
  'general-pest-control': {
    title: 'General Pest Control',
    subtitle: 'Year-round home protection covering 15+ pest types.',
    emoji: '🏠',
    image: '/images/service-detail-general.png',
    description:
      'Our flagship home protection plan is a proactive, year-round service that keeps your home sealed and pest-free. Quarterly scheduled visits ensure pests are intercepted before they can establish — covering over 15 common pest types.',
    details: [
      'Initial comprehensive inspection & baseline treatment',
      'Quarterly scheduled visits (4x per year)',
      'Interior and exterior perimeter treatment',
      '15+ pest types covered including ants, spiders, centipedes',
      'Emergency call-out service at no extra charge',
      '100% satisfaction guarantee',
    ],
    process: [
      { step: '01', title: 'Baseline Treatment', desc: 'Initial full-property inspection and comprehensive treatment to establish a pest-free baseline.' },
      { step: '02', title: 'Perimeter Defence', desc: 'Exterior perimeter treatment applied to create a lasting chemical barrier every quarter.' },
      { step: '03', title: 'Interior Touch-up', desc: 'Interior treatments focused on kitchens, bathrooms, and entry points each visit.' },
      { step: '04', title: 'Ongoing Protection', desc: 'Between-visit pest activity? We come back free of charge, guaranteed.' },
    ],
    faqs: [
      { q: 'What pests are covered?', a: 'Cockroaches, ants, spiders, centipedes, silverfish, earwigs, wasps, and more. Ask your technician for the full list.' },
      { q: 'What if I have a specific pest problem between visits?', a: 'Call us anytime. Emergency call-outs are included in the plan at no extra charge.' },
      { q: 'Can I cancel at any time?', a: 'Yes. Our plans are month-to-month with 30-day notice. No long-term contracts required.' },
    ],
  },
  'roach-control': {
    title: 'Roach Control',
    subtitle: 'Total elimination of German & American cockroach infestations.',
    emoji: '🪳',
    image: '/images/service-detail-roach.png',
    description:
      'Cockroaches are a significant health hazard, contaminating food and spreading diseases. Our Integrated Pest Management (IPM) protocol combines targeted gel baiting with long-term residual treatment to achieve absolute elimination.',
    details: [
      'Site-specific species identification',
      'High-precision gel bait application',
      'Insect Growth Regulator (IGR) treatment',
      'Entry point sealing and exclusion',
      'Harborage site destruction',
      '30-day performance follow-up',
    ],
    process: [
      { step: '01', title: 'Inspection', desc: 'Identify harborage sites and measure infestation severity.' },
      { step: '02', title: 'Baiting', desc: 'Apply professional-grade gel baits at points of high activity.' },
      { step: '03', title: 'Exclusion', desc: 'Seal gaps and cracks to prevent future ingress.' },
      { step: '04', title: 'Monitoring', desc: 'Confirm total elimination with a scheduled follow-up visit.' },
    ],
    faqs: [
      { q: 'How long until I see results?', a: 'Most infestations show 90% reduction within the first 48 hours.' },
      { q: 'Is it safe for pets?', a: 'Yes. Our baits are contained within cracks and crevices unreachable by pets.' },
      { q: 'Do I need to empty my cabinets?', a: 'Typically no, unless the infestation is severe. We will advise during inspection.' },
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES[slug];
  if (!service) return { title: 'Service Not Found' };
  return {
    title: service.title,
    description: service.subtitle,
  };
}

export async function generateStaticParams() {
  return Object.keys(SERVICES).map((slug) => ({ slug }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES[slug];
  if (!service) notFound();

  return (
    <Box component="main" sx={{ pt: '72px', minHeight: '100vh', bgcolor: tokens.obsidian }}>
      {/* Hero */}
      <Box
        sx={{
          bgcolor: tokens.surfaceDark,
          borderBottom: `1px solid ${tokens.border}`,
          py: { xs: 10, md: 14 },
          px: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Link href="/services" passHref style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'rgba(246,243,236,0.5)', mb: { xs: 4, md: 6 }, pl: 0, '&:hover': { color: tokens.citrus } }}
            >
              All Services
            </Button>
          </Link>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
              gap: { xs: 6, md: 10 },
              alignItems: 'center',
            }}
          >
            {/* Column 1: Text */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography sx={{ fontSize: '3rem', lineHeight: 1 }}>{service.emoji}</Typography>
                {service.tag && (
                  <Chip
                    label={service.tag}
                    sx={{
                      bgcolor: 'rgba(198,241,53,0.12)',
                      border: `1px solid ${tokens.citrus}`,
                      color: tokens.citrus,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              <Typography
                variant="h1"
                sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, lineHeight: 1.05, mb: 3 }}
              >
                {service.title}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(246,243,236,0.6)',
                  fontSize: '1.15rem',
                  maxWidth: 540,
                  lineHeight: 1.7,
                  mb: 5,
                }}
              >
                {service.description}
              </Typography>

              <Link href="/booking" passHref style={{ textDecoration: 'none', display: 'inline-block' }}>
                <Button
                  variant="contained"
                  size="large"
                  id={`${slug}-cta-hero`}
                  sx={{
                    bgcolor: tokens.citrus,
                    color: tokens.obsidian,
                    fontWeight: 700,
                    px: 4,
                    py: 1.8,
                    fontSize: '0.9rem',
                    borderRadius: '4px',
                  }}
                >
                  Request a Free Quote
                </Button>
              </Link>
            </Box>

            {/* Column 2: Image */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${tokens.border}`,
                boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
                aspectRatio: '16/10',
              }}
            >
              <Box
                component="img"
                src={service.image}
                alt={service.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* What's included + Process */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 8,
          }}
        >
          {/* What's Included */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.14em', display: 'block', mb: 3 }}
            >
              What&apos;s Included
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {service.details.map((detail, i) => (
                <Box
                  key={i}
                  component="li"
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${tokens.border}`,
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography sx={{ color: tokens.citrus, fontWeight: 700, minWidth: 20, mt: 0.1 }}>✓</Typography>
                  <Typography sx={{ color: 'rgba(246,243,236,0.8)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {detail}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Process */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.14em', display: 'block', mb: 3 }}
            >
              Our Process
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {service.process.map((p) => (
                <Box
                  key={p.step}
                  sx={{
                    display: 'flex',
                    gap: 3,
                    p: 3,
                    bgcolor: tokens.surfaceMid,
                    borderRadius: 1,
                    border: `1px solid ${tokens.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: tokens.citrus,
                      lineHeight: 1,
                      minWidth: 40,
                      opacity: 0.7,
                    }}
                  >
                    {p.step}
                  </Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.5, color: tokens.chalk }}>{p.title}</Typography>
                    <Typography sx={{ color: 'rgba(246,243,236,0.55)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {p.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* FAQs */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography
            variant="overline"
            sx={{ color: tokens.citrus, fontWeight: 700, letterSpacing: '0.14em', display: 'block', mb: 4 }}
          >
            Frequently Asked Questions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {service.faqs.map((faq, i) => (
              <Box
                key={i}
                sx={{
                  p: 3,
                  bgcolor: tokens.surfaceMid,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.chalk }}>{faq.q}</Typography>
                <Typography sx={{ color: 'rgba(246,243,236,0.6)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {faq.a}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom CTA */}
        <Box
          sx={{
            mt: { xs: 8, md: 12 },
            p: { xs: 4, md: 6 },
            bgcolor: tokens.surfaceMid,
            border: `1px solid ${tokens.citrus}`,
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 2 }}>
            Ready to Be Pest-Free?
          </Typography>
          <Typography sx={{ color: 'rgba(246,243,236,0.6)', mb: 4, maxWidth: 480, mx: 'auto' }}>
            Get a same-day free quote from one of our licensed technicians.
          </Typography>
          <Link href="/booking" passHref style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button
              variant="contained"
              size="large"
              id={`${slug}-cta-bottom`}
              sx={{ bgcolor: tokens.citrus, color: tokens.obsidian, fontWeight: 700, px: 5, py: 1.5 }}
            >
              Request a Free Quote
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
