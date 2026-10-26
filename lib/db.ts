import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

/** Reuses one connection across hot reloads and serverless invocations. */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (cached.conn) return cached.conn;
  cached.promise ??= mongoose.connect(uri, { bufferCommands: false });
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
