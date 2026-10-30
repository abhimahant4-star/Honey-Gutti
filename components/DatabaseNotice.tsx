import { DatabaseZap } from "lucide-react";

/** Shown on admin pages when MongoDB isn't connected yet. */
export function DatabaseNotice({ reason }: { reason: "not-configured" | "unreachable" }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-honey bg-honey-mist p-6 sm:p-8">
        <DatabaseZap className="text-honey-deep" size={36} />
        <h1 className="mt-3 font-display text-2xl font-bold">
          {reason === "not-configured" ? "Database not connected yet" : "Can't reach the database"}
        </h1>
        {reason === "not-configured" ? (
          <p className="mt-2 text-ink/80">
            You are logged in as admin, but <code className="rounded bg-white px-1">MONGODB_URI</code> is still the example
            or dummy value, so there are no orders to show. Orders and customer accounts are saved in MongoDB.
          </p>
        ) : (
          <p className="mt-2 text-ink/80">
            <code className="rounded bg-white px-1">MONGODB_URI</code> is set, but the database didn&apos;t answer. Check the
            username and password in the connection string, and in MongoDB Atlas allow access under{" "}
            <strong>Network Access</strong>.
          </p>
        )}
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-ink/80">
          <li>Create a free cluster at mongodb.com/atlas and copy its connection string.</li>
          <li>Put it in <code className="rounded bg-white px-1">MONGODB_URI</code> (in .env.local on your PC, and in Vercel).</li>
          <li>Restart <code className="rounded bg-white px-1">npm run dev</code> (or Redeploy on Vercel).</li>
        </ol>
      </div>
    </div>
  );
}
