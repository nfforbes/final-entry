const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const firstEq = line.indexOf('=');
      if (firstEq === -1) return;
      const key = line.substring(0, firstEq).trim();
      const value = line.substring(firstEq + 1).trim();
      if (key && value && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri =
  process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_BASE_URL || ''}/api/admin/google/callback`;
const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
  console.error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI must be set in .env.local');
  process.exit(1);
}

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true },
);

const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

async function syncTokens() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const googleConfig = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    redirectUri: googleRedirectUri,
  };

  await Setting.findOneAndUpdate(
    { key: 'google_config' },
    { value: JSON.stringify(googleConfig) },
    { upsert: true },
  );

  if (googleRefreshToken) {
    const googleTokens = {
      access_token: '',
      refresh_token: googleRefreshToken,
      expiry_date: 0,
      email: process.env.GOOGLE_SYNC_EMAIL || '',
    };

    await Setting.findOneAndUpdate(
      { key: 'google_integration' },
      { value: JSON.stringify(googleTokens) },
      { upsert: true },
    );
    console.log('Google integration tokens updated.');
  } else {
    console.log('GOOGLE_REFRESH_TOKEN not set; updated google_config only.');
  }

  console.log('Google integration updated successfully.');
  await mongoose.disconnect();
}

syncTokens().catch((err) => {
  console.error(err);
  process.exit(1);
});
