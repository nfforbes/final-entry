const mongoose = require('mongoose');

// Correct URI from .env.local
const MONGODB_URI = "mongodb+srv://nforbescci_db_user:y6GzBBvmivDXehX1@cluster0.6rqxcic.mongodb.net/?appName=Cluster0";

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true });

const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

async function syncTokens() {
  console.log('Connecting to MongoDB (Cluster0)...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const googleConfig = {
    clientId: "95148046562-ha7fkmnk68ijr79s3qibgh9ffkpseg14.apps.googleusercontent.com",
    clientSecret: "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",
    redirectUri: "https://localhost:3000/api/admin/google/callback"
  };

  const googleTokens = {
    access_token: "", 
    refresh_token: "1//04Io-q50EXPduCgYIARAAGAQSNwF-L9Irz_tpMmgP7x9L115_Fg1cUfECAx68auJ5WNkShVhR7i8787ou2k3d1JRXs4m9tP-n5zM",
    expiry_date: 0,
    email: "nfforbes@gmail.com"
  };

  await Setting.findOneAndUpdate(
    { key: 'google_config' },
    { value: JSON.stringify(googleConfig) },
    { upsert: true }
  );

  await Setting.findOneAndUpdate(
    { key: 'google_integration' },
    { value: JSON.stringify(googleTokens) },
    { upsert: true }
  );

  console.log('Google integration updated successfully in Cluster0');
  await mongoose.disconnect();
}

syncTokens().catch(err => {
  console.error(err);
  process.exit(1);
});
