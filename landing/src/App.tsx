import { MessageSquare, ThumbsUp, Shield, Zap, Download } from "lucide-react";
import PrivacyPolicy from "./PrivacyPolicy";

const features = [
  { icon: MessageSquare, title: "Komentariši oglase", description: "Ostavi komentar na bilo koji auto oglas" },
  { icon: ThumbsUp, title: "Odgovori i glasaj", description: "Glasaj za korisne komentare drugih" },
  { icon: Shield, title: "Bez naloga", description: "Anonimno, bez registracije" },
  { icon: Zap, title: "U realnom vremenu", description: "Komentari se pojavljuju odmah" },
] as const;

const steps = [
  { number: "01", text: "Instaliraj ekstenziju" },
  { number: "02", text: "Otvori oglas na Polovnim" },
  { number: "03", text: "Ostavi komentar" },
] as const;

export default function App() {
  if (window.location.pathname === "/privacy") {
    return <PrivacyPolicy />;
  }

  return (
    <div className="h-screen bg-[#0a0a0a] relative overflow-hidden flex flex-col">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08)_0%,_transparent_60%)]" />

      {/* ===== HERO ===== */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon + Heading row */}
          <div className="flex items-center justify-center gap-5 mb-4 animate-fade-up">
            <div className="icon-glow shrink-0">
              <img
                src="/icons/icon128.png"
                alt="Polovni Automobili Comments"
                width={72}
                height={72}
                className="relative z-10 drop-shadow-2xl"
              />
            </div>
            <h1 className="font-[Outfit] font-900 text-4xl md:text-6xl lg:text-7xl tracking-tight text-[#fafafa]">
              Polovni Automobili{" "}
              <span className="bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ea580c] bg-clip-text text-transparent">
                Comments
              </span>
            </h1>
          </div>

          <p className="font-[Outfit] font-500 text-lg md:text-xl text-[#fafafa]/80 mb-2 animate-fade-up-delay-1">
            Komentari na svakom oglasu na Polovnim
          </p>

          <p className="text-[#a1a1aa] text-sm md:text-base max-w-xl mx-auto mb-6 animate-fade-up-delay-2">
            Ostavi mišljenje, odgovori drugima i glasaj za korisne komentare — direktno na stranici oglasa.
          </p>

          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow inline-flex items-center gap-2 bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ea580c] text-white font-[Outfit] font-700 text-base px-6 py-3 rounded-xl animate-fade-up-delay-3"
          >
            <Download className="w-4 h-4" />
            Preuzmi za Chrome
          </a>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`card-hover bg-[#18181b] rounded-xl p-4 animate-fade-up-delay-${i + 1}`}
            >
              <feature.icon className="w-5 h-5 text-[#f97316] mb-2" />
              <h3 className="font-[Outfit] font-700 text-sm text-[#fafafa] mb-1">
                {feature.title}
              </h3>
              <p className="text-[#a1a1aa] text-xs leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HOW IT WORKS + FOOTER ===== */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Steps row */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-5">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-[Outfit] font-900 text-lg bg-gradient-to-b from-[#f97316]/40 to-transparent bg-clip-text text-transparent select-none">
                    {step.number}
                  </span>
                  <span className="text-[#fafafa]/70 text-xs md:text-sm font-[Outfit]">
                    {step.text}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-[#27272a] text-xs">→</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[#a1a1aa] text-xs">
            <span>&copy; 2026 Polovni Automobili Comments</span>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-[#fafafa] transition-colors">Politika privatnosti</a>
              <a href="#" className="hover:text-[#fafafa] transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
