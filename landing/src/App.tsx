import { MessageSquare, ThumbsUp, Shield, Zap, Download, ChevronUp, ChevronDown, User, X } from "lucide-react";
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

function CommentDemo() {
  return (
    <div className="w-full max-w-[360px] bg-white rounded-xl border border-[#e5e5e5] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0f0f0]">
        <span className="font-[Outfit] font-700 text-sm text-[#1a1a1a]">
          Komentari <span className="font-400 text-[#9ca3af]">(3)</span>
        </span>
        <X className="w-4 h-4 text-[#9ca3af]" />
      </div>

      {/* Comments */}
      <div className="divide-y divide-[#f5f5f5]">
        {/* Comment 1 + reply */}
        <div className="px-4 py-3">
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-[#9ca3af]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-500 text-[#6b7280]">Golf123</span>
              <p className="text-sm text-[#1a1a1a] mt-0.5 leading-snug">Deluje solidno za te pare.</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#9ca3af]">pre 2h</span>
                  <span className="text-[10px] text-[#9ca3af] cursor-pointer">Odgovori</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <ChevronUp className="w-3.5 h-3.5 text-[#E5A100]" />
                  <span className="text-[11px] font-600 text-[#6b7280] w-4 text-center">5</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
                </div>
              </div>
            </div>
          </div>

          {/* Reply */}
          <div className="ml-9 mt-2.5 pl-3 border-l-2 border-[#f0f0f0]">
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-[#9ca3af]" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-500 text-[#6b7280]">Audi_BG</span>
                <p className="text-xs text-[#1a1a1a] mt-0.5 leading-snug">Slažem se, proverio bih motor.</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#9ca3af]">pre 1h</span>
                  <div className="flex items-center gap-0.5">
                    <ChevronUp className="w-3 h-3 text-[#9ca3af]" />
                    <span className="text-[10px] font-600 text-[#6b7280] w-3 text-center">2</span>
                    <ChevronDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comment 2 */}
        <div className="px-4 py-3">
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-[#9ca3af]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-500 text-[#6b7280]">BMW_NS</span>
              <p className="text-sm text-[#1a1a1a] mt-0.5 leading-snug">Kilometraža deluje sumnjivo...</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#9ca3af]">pre 45min</span>
                  <span className="text-[10px] text-[#9ca3af] cursor-pointer">Odgovori</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <ChevronUp className="w-3.5 h-3.5 text-[#E5A100]" />
                  <span className="text-[11px] font-600 text-[#6b7280] w-4 text-center">8</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input form */}
      <div className="px-4 py-3 border-t border-[#f0f0f0] bg-[#fafafa]">
        <div className="text-[10px] font-500 uppercase tracking-wider text-[#9ca3af] mb-1.5">Komentar</div>
        <div className="bg-white border border-[#e5e5e5] rounded-md px-3 py-2 text-xs text-[#9ca3af] mb-2 leading-relaxed">
          Ostavi komentar...
        </div>
        <div className="flex justify-end">
          <div className="bg-[#E5A100] text-white text-xs font-[Outfit] font-600 px-3.5 py-1.5 rounded-md">
            Postavi
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  if (window.location.pathname === "/privacy") {
    return <PrivacyPolicy />;
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      <div className="h-1 bg-[#E5A100]" />

      {/* Hero split */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Hero */}
          <div className="text-center lg:text-left animate-fade-up">
            <div className="mb-5">
              <img
                src="/icons/icon128.png"
                alt=""
                width={56}
                height={56}
                className="mx-auto lg:mx-0"
              />
            </div>

            <h1 className="font-[Outfit] font-900 text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.9] mb-4">
              <span className="text-[#1a1a1a]">Polovni</span>
              <br />
              <span className="text-[#E5A100]">Komentari</span>
            </h1>

            <p className="font-[Outfit] font-500 text-lg sm:text-xl text-[#6b7280] mb-8">
              Komentari na svakom oglasu
            </p>

            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta inline-flex items-center gap-2.5 bg-[#E5A100] text-white font-[Outfit] font-700 text-base sm:text-lg px-7 py-3.5 rounded-lg"
            >
              <Download className="w-5 h-5" />
              Preuzmi za Chrome
            </a>
          </div>

          {/* Right: Demo */}
          <div className="hidden lg:flex flex-1 justify-center animate-fade-up-delay-2">
            <CommentDemo />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <div className="max-w-4xl mx-auto">
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
