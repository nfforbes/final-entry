import { Schema, model, models, Document } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const Setting = models.Setting || model<ISetting>('Setting', SettingSchema);

// Default theme settings seed
export const DEFAULT_SETTINGS: Array<{ key: string; value: string }> = [
  { key: 'themeMode', value: 'dark' },
  { key: 'accentColor', value: '#C6F135' },
  { key: 'primaryColor', value: '#0B0B0F' },
  { key: 'companyName', value: 'Final Entry' },
  { key: 'phone', value: '+1 (876) 000-0000' },
  { key: 'email', value: 'info@finalentry.com.jm' },
  { key: 'heroTagline', value: "Jamaica's Pest Elimination Authority" },
];
