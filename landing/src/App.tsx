import { MessageSquare, ThumbsUp, Shield, Zap, Download, ChevronRight } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Komentariši oglase",
    description: "Ostavi komentar na bilo koji auto oglas na polovniautomobili.com",
  },
  {
    icon: ThumbsUp,
    title: "Odgovori i glasaj",
    description: "Odgovori na komentare drugih korisnika i glasaj za korisne",
  },
  {
    icon: Shield,
    title: "Bez naloga",
    description: "Koristi anonimno, bez registracije ili prijavljivanja",
  },
  {
    icon: Zap,
    title: "U realnom vremenu",
    description: "Komentari se pojavljuju odmah, bez osvežavanja stranice",
  },
] as const;

const steps = [
  {
    number: "01",
    text: "Instaliraj ekstenziju iz Chrome Web Store",
  },
  {
    number: "02",
    text: "Otvori bilo koji oglas na polovniautomobili.com",
  },
  {
    number: "03",
    text: "Klikni na narandžasto dugme i ostavi komentar",
  },
] as const;

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Background ambient gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08)_0%,_transparent_60%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Extension icon with glow */}
          <div className="icon-glow inline-block mb-10 animate-fade-up">
            <img
              src="/icons/icon128.png"
              alt="Polovni Automobili Comments"
              width={128}
              height={128}
              className="relative z-10 drop-shadow-2xl"
            />
          </div>

          {/* Heading */}
          <h1 className="font-[Outfit] font-900 text-5xl md:text-7xl lg:text-8xl tracking-tight text-[#fafafa] mb-6 animate-fade-up-delay-1">
            Polovni Automobili{" "}
            <span className="bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ea580c] bg-clip-text text-transparent">
              Comments
            </span>
          </h1>

          {/* Tagline */}
          <p className="font-[Outfit] font-500 text-xl md:text-2xl text-[#fafafa]/80 mb-4 animate-fade-up-delay-2">
            Komentari na svakom oglasu na Polovnim
          </p>

          {/* Description */}
          <p className="text-[#a1a1aa] text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up-delay-3">
            Ostavi mišljenje, odgovori drugima i glasaj za korisne komentare
            — direktno na stranici oglasa.
          </p>

          {/* CTA Button */}
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow inline-flex items-center gap-3 bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ea580c] text-white font-[Outfit] font-700 text-lg px-8 py-4 rounded-xl animate-fade-up-delay-4"
          >
            <Download className="w-5 h-5" />
            Preuzmi za Chrome
          </a>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-delay">
          <div className="w-px h-12 bg-gradient-to-b from-[#a1a1aa]/40 to-transparent" />
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider max-w-5xl mx-auto" />

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="font-[Outfit] font-800 text-3xl md:text-5xl text-[#fafafa] mb-4">
              Sve što ti treba
            </h2>
            <p className="text-[#a1a1aa] text-base md:text-lg max-w-lg mx-auto">
              Jednostavna ekstenzija sa svim potrebnim funkcijama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`card-hover bg-[#18181b] rounded-2xl p-7 md:p-8 ${
                  i === 0
                    ? "animate-fade-up-delay-1"
                    : i === 1
                      ? "animate-fade-up-delay-2"
                      : i === 2
                        ? "animate-fade-up-delay-3"
                        : "animate-fade-up-delay-4"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f97316]/20 to-[#f59e0b]/5 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-[#f97316]" />
                </div>
                <h3 className="font-[Outfit] font-700 text-xl text-[#fafafa] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider max-w-5xl mx-auto" />

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="relative px-6 py-24 md:py-32">
        {/* Subtle background layer */}
        <div className="absolute inset-0 bg-[#111111]/50" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="font-[Outfit] font-800 text-3xl md:text-5xl text-[#fafafa] mb-4">
              Kako funkcioniše
            </h2>
            <p className="text-[#a1a1aa] text-base md:text-lg">
              Tri koraka do prvog komentara
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`relative text-center md:text-left ${
                  i === 0
                    ? "animate-fade-up-delay-1"
                    : i === 1
                      ? "animate-fade-up-delay-2"
                      : "animate-fade-up-delay-3"
                }`}
              >
                {/* Step number */}
                <div className="font-[Outfit] font-900 text-6xl md:text-7xl bg-gradient-to-b from-[#f97316]/25 to-transparent bg-clip-text text-transparent mb-4 select-none">
                  {step.number}
                </div>

                {/* Step text */}
                <p className="text-[#fafafa] font-[Outfit] font-500 text-lg leading-snug">
                  {step.text}
                </p>

                {/* Arrow connector (desktop only, not on last) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-10 -right-3 text-[#27272a]">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider max-w-5xl mx-auto" />

      {/* ===== FOOTER ===== */}
      <footer className="relative px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[#a1a1aa] text-sm order-2 md:order-1">
            &copy; 2026 Polovni Automobili Comments
          </p>

          <div className="flex items-center gap-6 order-1 md:order-2">
            <a
              href="#"
              className="text-[#a1a1aa] hover:text-[#fafafa] text-sm transition-colors"
            >
              Politika privatnosti
            </a>
            <a
              href="#"
              className="text-[#a1a1aa] hover:text-[#fafafa] text-sm transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
