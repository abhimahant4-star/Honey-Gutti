import { NextResponse } from "next/server";
import { isSameOrigin, jsonError } from "./http";
import { getAdmin } from "./session";
import { isDbConfigured, isDbConnectionError } from "./db";

/** Every admin API call: must come from our own site (CSRF) and carry a valid admin login. */
export async function guardAdmin(req: Request): Promise<NextResponse | null> {
  if (req.method !== "GET" && !isSameOrigin(req)) return jsonError("Request blocked.", 403);
  if (!(await getAdmin())) return jsonError("Please log in as admin again.", 401);
  if (!isDbConfigured()) return jsonError("The database is not connected.", 503);
  return null;
}
 
export function adminDbError(e: unknown, what: string) {
  if (isDbConnectionError(e)) return jsonError("Can't connect to the database. Check MONGODB_URI and Network Access in MongoDB Atlas.", 503);
  console.error(`admin ${what} failed`, e);
  return jsonError("Something went wrong. Please try again.", 500);
}
