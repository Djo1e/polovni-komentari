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
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      <div className="h-1 bg-[#E5A100]" />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-5 animate-fade-up">
            <img src="/icons/icon128.png" alt="" width={56} height={56} className="mx-auto" />
          </div>

          <h1 className="font-[Outfit] font-900 text-5xl sm:text-7xl md:text-8xl tracking-tighter leading-[0.9] mb-4 animate-fade-up">
            <span className="text-[#1a1a1a]">Polovni</span>
            <br />
            <span className="text-[#E5A100]">Komentari</span>
          </h1>

          <p className="font-[Outfit] font-500 text-lg sm:text-xl text-[#6b7280] mb-8 animate-fade-up-delay-1">
            Komentari na svakom oglasu
          </p>

          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-flex items-center gap-2.5 bg-[#E5A100] text-white font-[Outfit] font-700 text-base sm:text-lg px-7 py-3.5 rounded-lg animate-fade-up-delay-2"
          >
            <Download className="w-5 h-5" />
            Preuzmi za Chrome
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-5">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`feature-card bg-[#fafafa] rounded-md p-4 animate-fade-up-delay-${i + 1}`}
            >
              <feature.icon className="w-5 h-5 text-[#E5A100] mb-2" />
              <h3 className="font-[Outfit] font-700 text-sm text-[#1a1a1a] mb-1">
                {feature.title}
              </h3>
              <p className="text-[#6b7280] text-xs leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps + Footer */}
      <div className="px-6 pb-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 md:gap-5 mb-4">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center gap-3 md:gap-5">
                <div className="flex items-center gap-2">
                  <span className="font-[Outfit] font-900 text-lg text-[#E5A100]">
                    {step.number}
                  </span>
                  <span className="text-[#1a1a1a] text-xs md:text-sm font-[Outfit] font-500">
                    {step.text}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-[#d4d4d4] text-sm">→</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[#6b7280] text-xs border-t border-[#e5e5e5] pt-4">
            <span>&copy; 2026 Polovni Komentari</span>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Politika privatnosti</a>
              <a href="#" className="hover:text-[#1a1a1a] transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
