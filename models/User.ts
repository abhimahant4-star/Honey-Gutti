import { Model, Schema, model, models } from "mongoose";

/** Customer accounts. The shop owner (admin) is NOT stored here; see lib/admin.ts. */
export type UserLean = {
  _id: { toString(): string };
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  failedLogins?: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
};

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false }, // never returned unless asked for
    failedLogins: { type: Number, default: 0 },
    lockUntil: Date,
    lastLoginAt: Date,
    // password reset: only a SHA-256 hash of the emailed token is stored
    resetTokenHash: { type: String, select: false, index: true, sparse: true },
    resetTokenExpires: { type: Date, select: false },
    passwordChangedAt: Date, // logins created before this time stop working
  },
  { timestamps: true }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const User: Model<any> = models.User || model("User", UserSchema);
