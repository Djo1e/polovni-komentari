import { Download, ChevronUp, ChevronDown, User } from "lucide-react";
import PrivacyPolicy from "./PrivacyPolicy";

const steps = [
  { number: "01", text: "Instaliraj ekstenziju" },
  { number: "02", text: "Otvori oglas na Polovnim" },
  { number: "03", text: "Ostavi komentar" },
] as const;

const CWS_URL = "https://chromewebstore.google.com/detail/polovni-komentari/hjaehnglllmhjbbflknfpjofpnocmnkl";

function Comment({ username, text, time, votes, voted }: {
  username: string; text: string; time: string; votes: number; voted?: boolean;
}) {
  return (
    <div className="flex gap-1.5">
      <div className="mt-2 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <User className="w-2 h-2 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[8px] font-medium text-gray-500 leading-[16px]">{username}</span>
        <p className="text-[9px] text-gray-800 leading-snug">{text}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] text-gray-400">{time}</span>
            <span className="text-[7px] text-gray-400">Odgovori</span>
          </div>
          <div className="flex items-center">
            <ChevronUp className={`w-2.5 h-2.5 ${voted ? "text-orange-500" : "text-gray-300"}`} />
            <span className="text-[8px] font-semibold text-gray-600 w-2.5 text-center">{votes}</span>
            <ChevronDown className="w-2.5 h-2.5 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Reply({ username, text, time, votes }: {
  username: string; text: string; time: string; votes: number;
}) {
  return (
    <div className="ml-5 mt-1 pl-1.5 border-l border-gray-100">
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <User className="w-1.5 h-1.5 text-gray-400" />
        </div>
        <div className="flex-1">
          <span className="text-[7px] font-medium text-gray-500">{username}</span>
          <p className="text-[8px] text-gray-800 leading-snug">{text}</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[6px] text-gray-400">{time}</span>
            <div className="flex items-center">
              <ChevronUp className="w-2 h-2 text-gray-300" />
              <span className="text-[7px] font-semibold text-gray-600 w-2 text-center">{votes}</span>
              <ChevronDown className="w-2 h-2 text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDemo() {
  return (
    <div className="relative w-full max-w-[975px] rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#e5e5e5]">
      {/* Full-width screenshot */}
      <img
        src="/demo.webp"
        alt="Polovni Komentari na polovniautomobili.com"
        className="block w-full h-auto"
      />

      {/* Comments overlay covering "Nema komentara" empty area */}
      <div
        className="absolute bg-white overflow-hidden"
        style={{ left: "63.5%", top: "30%", right: "0.5%", bottom: "5%" }}
      >
        <div className="divide-y divide-gray-100">
          <div className="px-2 py-1.5 comment-enter comment-enter-1">
            <Comment username="Golf123" text="Deluje solidno za te pare." time="pre 2h" votes={5} voted />
            <Reply username="Audi_BG" text="Slažem se, proverio bih motor." time="pre 1h" votes={2} />
          </div>
          <div className="px-2 py-1.5 comment-enter comment-enter-2">
            <Comment username="BMW_NS" text="Kilometraža deluje sumnjivo..." time="pre 45min" votes={8} voted />
          </div>
          <div className="px-2 py-1.5 comment-enter comment-enter-3">
            <Comment username="Fiat_KG" text="Za 2018. godište korektna cena." time="pre 30min" votes={3} />
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
              href={CWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta inline-flex items-center gap-2.5 bg-[#E5A100] text-white font-[Outfit] font-700 text-base sm:text-lg px-7 py-3.5 rounded-lg"
            >
              <Download className="w-5 h-5" />
              Preuzmi za Chrome
            </a>
          </div>

          {/* Right: Product demo */}
          <div className="hidden lg:flex flex-1 justify-center animate-fade-up-delay-2">
            <ProductDemo />
          </div>
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
