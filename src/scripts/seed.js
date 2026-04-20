const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Simple .env.local parser to avoid dependency on dotenv for the seed script
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const firstEq = line.indexOf('=');
    if (firstEq !== -1) {
      const key = line.substring(0, firstEq).trim();
      const value = line.substring(firstEq + 1).trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

const Schema = mongoose.Schema;

// Redefine Schema here
const ServiceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    icon: { type: String, required: true },
    image: { type: String },
    features: [{ type: String }],
    pestTypes: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

const SERVICES = [
  {
    slug: 'fumigation',
    title: 'Fumigation',
    description: 'Precision high-level fumigation for complete area sterilization. We use advanced chemical methods to eliminate all deep-seated pests in residential and commercial properties.',
    shortDescription: 'Precision high-level fumigation for sterilization.',
    priceRange: { min: 450, max: 2500 },
    icon: 'BugReport',
    image: '/images/service-fumigation.png',
    features: ['Area Sterilization', 'Deep Pest Elimination', 'Commercial Grade'],
    pestTypes: ['Termites', 'Roaches', 'Bed Bugs'],
    order: 1,
    isActive: true
  },
  {
    slug: 'termite-control',
    title: 'Termite Control',
    description: 'Targeted baiting and barrier systems that protect your structure long-term from the destructive path of termites.',
    shortDescription: 'Protect your structure from termite damage.',
    priceRange: { min: 800, max: 4000 },
    icon: 'PestControl',
    image: '/images/service-termite.png',
    features: ['Barrier Protection', 'Baiting Systems', 'Damage Assessment'],
    pestTypes: ['Termites'],
    order: 2,
    isActive: true
  },
  {
    slug: 'roach-control',
    title: 'Roach Control',
    description: 'Total elimination of German and American cockroach infestations using a combination of gel baits and spray residuals.',
    shortDescription: 'Total elimination of cockroach infestations.',
    priceRange: { min: 250, max: 1200 },
    icon: 'BugReport',
    image: '/images/service-roach.png',
    features: ['Gel Baiting', 'Residual Spray', 'Egg Case Removal'],
    pestTypes: ['German Cockroaches', 'American Cockroaches'],
    order: 3,
    isActive: true
  },
  {
    slug: 'rodent-removal',
    title: 'Rodent Removal',
    description: 'Rats and mice eliminated. Entry points sealed. We ensure your property stays rodent-free with professional exclusion methods.',
    shortDescription: 'Rats and mice elimination and exclusion.',
    priceRange: { min: 300, max: 1500 },
    icon: 'PestControlRodent',
    image: '/images/service-rodent.png',
    features: ['Exclusion', 'Trapping', 'Sanitation'],
    pestTypes: ['Rats', 'Mice'],
    order: 4,
    isActive: true
  },
  {
    slug: 'mosquito-control',
    title: 'Mosquito Control',
    description: 'Reduce dengue and Zika risk with seasonal outdoor treatment programs that break the lifecycle of mosquitoes.',
    shortDescription: 'Seasonal outdoor treatment programs.',
    priceRange: { min: 200, max: 800 },
    icon: 'LocalFlorist',
    image: '/images/service-mosquito.png',
    features: ['Fogging', 'Larvicide', 'Source Reduction'],
    pestTypes: ['Mosquitoes'],
    order: 5,
    isActive: true
  },
  {
    slug: 'bed-bug-treatment',
    title: 'Bed Bug Treatment',
    description: 'Comprehensive heat and chemical treatments for total bed bug eradication in homes and hotels.',
    shortDescription: 'Heat and chemical eradication treatments.',
    priceRange: { min: 500, max: 3000 },
    icon: 'BugReport',
    image: '/images/service-bedbug.png',
    features: ['Heat Treatment', 'Steam', 'Chemical Residual'],
    pestTypes: ['Bed Bugs'],
    order: 6,
    isActive: true
  },
  {
    slug: 'general-pest-control',
    title: 'General Pest Control',
    description: 'Year-round home protection plan covering 15+ common Jamaican pest types including ants, spiders, and silverfish.',
    shortDescription: 'Year-round home protection plan.',
    priceRange: { min: 200, max: 600 },
    icon: 'PestControl',
    image: '/images/service-general.png',
    features: ['Quarterly Service', 'Perimeter Shield', 'Interior Treatment'],
    pestTypes: ['Ants', 'Spiders', 'Silverfish', 'Centipedes'],
    order: 7,
    isActive: true
  }
];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    console.log('Clearing existing services...');
    await Service.deleteMany({});

    console.log('Seeding services...');
    await Service.insertMany(SERVICES);

    console.log('Seeding successful!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
