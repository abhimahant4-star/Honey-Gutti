// Checks the MongoDB connection using MONGODB_URI from .env.local / .env
// Run from the project folder:   node scripts/check-db.mjs
import nextEnv from "@next/env";
import mongoose from "mongoose";
import dns from "node:dns/promises";

nextEnv.loadEnvConfig(process.cwd());
const uri = (process.env.MONGODB_URI || "").trim();
const hide = (u) => u.replace(/\/\/([^:@/]+):([^@]*)@/, "//$1:****@");

console.log("\nChecking MongoDB connection...");
console.log("MONGODB_URI =", uri ? hide(uri) : "(not set)");

if (!uri) {
  console.log("\n❌ MONGODB_URI is empty. Put it in .env.local.\n");
  process.exit(1);
}
if (/<db_password>|USER:PASSWORD@CLUSTER|dummy/i.test(uri)) {
  console.log("\n❌ MONGODB_URI still has the example/dummy value or <db_password>. Put your real password in.\n");
  process.exit(1);
}

const m = uri.match(/^mongodb(\+srv)?:\/\/(?:[^@]+@)?([^/?]+)/);
const host = m?.[2] ?? "";
if (m?.[1] && host) {
  try {
    const srv = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    console.log(`✅ DNS lookup OK: found ${srv.length} database servers for ${host}`);
  } catch (e) {
    console.log(`\n❌ DNS lookup FAILED for ${host} (${e.code}).`);
    console.log("   Either the cluster name is wrong, or your internet provider's DNS can't look up MongoDB addresses.");
    console.log("   Fix: check the cluster name in Atlas > Connect, OR change your PC's DNS to 8.8.8.8 / 1.1.1.1");
    console.log("   (Windows Settings > Network > your connection > DNS server assignment > Edit), then try again.\n");
    process.exit(1);
  }
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  await db.admin().command({ ping: 1 });
  const cols = (await db.listCollections().toArray()).map((c) => c.name);
  console.log(`\n✅ CONNECTED to database "${db.databaseName}". Collections: ${cols.length ? cols.join(", ") : "(none yet - normal before the first signup/order)"}`);
  if (db.databaseName === "test") {
    console.log('ℹ️  Tip: add a database name, e.g. ...mongodb.net/doyjoy?retryWrites=true&w=majority');
  }
  console.log("\nIf the website still says it can't connect: stop it with Ctrl+C and run npm run dev again.\n");
  await mongoose.disconnect();
  process.exit(0);
} catch (e) {
  const msg = String(e?.message || e);
  console.log("\n❌ Could not connect. Error from MongoDB:\n   " + msg.split("\n")[0]);
  if (/bad auth|authentication failed/i.test(msg)) {
    console.log("\n👉 WRONG USERNAME OR PASSWORD.");
    console.log("   Atlas > Database Access > Edit your user > Edit Password > set a new one (letters and numbers only),");
    console.log("   click Update User, put the same password in .env.local, and run this again.");
  } else if (/whitelist|IP address|not authorized|Server selection timed out|ReplicaSetNoPrimary|ETIMEDOUT|ECONNREFUSED|Could not connect to any servers/i.test(msg)) {
    console.log("\n👉 YOUR PC IS NOT ALLOWED TO CONNECT (most common), or a firewall/network blocks port 27017.");
    console.log("   Atlas > Security > Network Access > Add IP Address > 'Allow access from anywhere' (0.0.0.0/0) > Confirm.");
    console.log("   Wait 1-2 minutes until it shows 'Active', then run this again.");
    console.log("   Also check the cluster is not Paused (Atlas > Database > Resume).");
    console.log("   On office/college Wi-Fi, port 27017 may be blocked: try your mobile hotspot.");
  } else if (/querySrv|ENOTFOUND|EREFUSED/i.test(msg)) {
    console.log("\n👉 DNS PROBLEM: change your PC's DNS to 8.8.8.8 / 1.1.1.1 and try again.");
  } else if (/MongoParseError|Invalid scheme|URI/i.test(msg)) {
    console.log("\n👉 THE CONNECTION STRING IS BADLY FORMATTED. Copy it again from Atlas > Connect > Drivers.");
  }
  console.log("");
  process.exit(1);
}
