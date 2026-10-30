import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

/** True when MONGODB_URI is missing or still the example/dummy value. */
export function isDbConfigured(): boolean {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return false;
  return !/USER:PASSWORD@CLUSTER|dummyuser|dummy-cluster/i.test(uri);
}

/** True for "can't reach / can't log in to MongoDB" errors (wrong URI, password, or network access). */
export function isDbConnectionError(e: unknown): boolean {
  const err = e as { name?: string; code?: string; message?: string } | null;
  if (!err) return false;
  return (
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoServerSelectionError" ||
    err.name === "MongoParseError" ||
    err.code === "ENOTFOUND" ||
    err.code === "ECONNREFUSED" ||
    /querySrv|authentication failed|bad auth|ENOTFOUND|ETIMEOUT|URI/i.test(err.message ?? "")
  );
}

/** Reuses one connection across hot reloads and serverless invocations. */
export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri || !isDbConfigured()) throw new Error("MONGODB_URI is not set to a real MongoDB connection string");
  if (cached.conn) return cached.conn;
  // fail within 8 seconds instead of 30 if the database can't be reached
  cached.promise ??= mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
