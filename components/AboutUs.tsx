import { ChevronsRight, HandHeart, Rocket, ShieldCheck, Sparkles, Target } from "lucide-react";

const values = [
  { icon: ShieldCheck, title: "Trust", text: "Our foundation." },
  { icon: HandHeart, title: "Responsibility", text: "Our duty." },
  { icon: Target, title: "Commitment", text: "Our promise." },
];

const founders = [
  { name: "Naveen Kumar Arora", role: "Founder" },
  { name: "Dr. Anjusha Sharma", role: "Founder" },
];

const initials = (name: string) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

export function AboutUs() {
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <p className="font-semibold uppercase tracking-wider text-honey-deep">About us</p>
      <h2 id="about-title" className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        The Doy &amp; Joy Group of Companies
      </h2>

      <ul className="mt-5 flex flex-wrap gap-3">
        {["Because real needs need real solutions.", "From Doy & Joy to your homes."].map((t) => (
          <li key={t} className="flex items-center gap-1.5 rounded-full bg-honey-soft px-4 py-2 font-semibold text-ink">
            <ChevronsRight size={18} className="shrink-0 text-honey-deep" aria-hidden />
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 text-lg leading-relaxed text-ink/85">
          <p>
            The journey of a dream began in <strong className="text-ink">2024</strong>, driven by a shared vision of two
            family friends, both veterinary pharmaceutical professionals (Doy and Joy), to build a company founded on
            trust, integrity and excellence.
          </p>
          <p>
            At The Doy &amp; Joy Group of Companies, we believe that every great achievement begins with a commitment to
            improving lives. Our vision is to create meaningful value through innovation, quality and a deep
            understanding of human needs.
          </p>
          <p>
            Driven by a passion for excellence and a forward-thinking approach, we aspire to contribute to a healthier,
            happier and more progressive society. We are committed to building lasting relationships, creating new
            opportunities and making a meaningful difference through our work.
          </p>
          <p>
            With trust as our foundation, responsibility as our duty and commitment as our promise, we strive to build a
            lasting legacy of excellence.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <blockquote className="rounded-2xl bg-pack p-6 text-white">
            <Sparkles className="text-honey" aria-hidden />
            <p className="mt-3 font-display text-2xl font-bold leading-snug">
              We don&apos;t just envision a better future — we work towards making it a reality.
            </p>
          </blockquote>
          <ul className="grid gap-3 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex items-center gap-4 rounded-2xl border border-ink/10 p-4 sm:flex-col sm:gap-2 sm:text-center"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-dark">
                  <Icon size={20} aria-hidden />
                </span>
                <div>
                  <p className="font-display font-bold leading-tight">{title}</p>
                  <p className="text-sm text-ink/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14 rounded-3xl bg-honey-mist p-6 sm:p-10">
        <h3 className="font-display text-2xl font-bold sm:text-3xl">Our founders</h3>
        <p className="mt-3 max-w-3xl text-ink/80">
          Both founders belong to the veterinary profession and share a common vision of building a company rooted in
          professional expertise and integrity, and of hitting the bull&apos;s-eye every time.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-leaf-dark">
          <Target size={18} aria-hidden /> Our motto is simple: give what is needed.
        </p>

        <ul className="mt-8 grid items-start gap-5 sm:grid-cols-2">
          {founders.map((f) => (
            <li key={f.name} className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5">
              <span
                aria-hidden
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-leaf font-display text-xl font-bold text-white"
              >
                {initials(f.name)}
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight">{f.name}</p>
                <p className="text-sm text-ink/70">{f.role} · Veterinary professional</p>
              </div>
            </li>
          ))}

          <li className="flex flex-col gap-3 rounded-2xl border-2 border-honey bg-white p-5 sm:col-span-2 md:flex-row md:items-center md:gap-8 md:p-6">
            <div className="flex shrink-0 items-center gap-4 md:w-64">
              <span
                aria-hidden
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-honey font-display text-xl font-bold text-ink"
              >
                {initials("Lakshay Arora")}
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight">Lakshay Arora</p>
                <p className="flex items-center gap-1 text-sm font-semibold text-honey-deep">
                  <Rocket size={14} aria-hidden /> Chief Executive Officer
                </p>
              </div>
            </div>
            <p className="text-ink/80 md:border-l md:border-honey/50 md:pl-8">
              At just 17, Lakshay brings young energy, fresh ideas and a clear sense of purpose to Doy &amp; Joy. He is
              passionate about his goals and vision, and leads the company forward on the same values of trust and
              integrity it was founded on.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
