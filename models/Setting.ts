import { Model, Schema, model, models } from "mongoose";

/** Shop-wide settings, changed in /admin/settings. One document with key "store". */
export type StoreSettings = {
  comingSoonLimit: number; // how many "Coming soon" cards the website shows (0 = hide the section)
  comingSoonTitle: string; // heading above those cards
};

export const DEFAULT_SETTINGS: StoreSettings = { comingSoonLimit: 4, comingSoonTitle: "Coming soon" };

const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    comingSoonLimit: { type: Number, min: 0, max: 12, default: DEFAULT_SETTINGS.comingSoonLimit },
    comingSoonTitle: { type: String, trim: true, maxlength: 60, default: DEFAULT_SETTINGS.comingSoonTitle },
  },
  { timestamps: true, strict: true }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Setting: Model<any> = models.Setting || model("Setting", SettingSchema);
