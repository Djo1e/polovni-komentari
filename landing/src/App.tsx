import { Download, ChevronUp, ChevronDown, User, MessageSquare, ThumbsUp, Shield, Eye } from "lucide-react";
import { track } from "@vercel/analytics";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";

const steps = [
  { number: "01", text: "Instaliraj ekstenziju" },
  { number: "02", text: "Otvori oglas" },
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
    <div className="w-full max-w-[975px] rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#e5e5e5]">
      {/* Inner wrapper: crops left ~30% on mobile, full on desktop */}
      <div className="relative w-[145%] -ml-[40%] lg:w-full lg:ml-0">
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
    </div>
  );
}

export default function App() {
  if (window.location.pathname === "/privacy") {
    return <PrivacyPolicy />;
  }

  if (window.location.pathname === "/terms") {
    return <TermsOfService />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="h-1 bg-[#E5A100]" />

      {/* Hero split */}
      <div className="flex items-center justify-center px-6 lg:px-10 py-12 lg:py-20">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
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

            <p className="font-[Outfit] text-lg sm:text-xl text-[#6b7280] mb-8">
              Iskustva, recenzije i komentari za polovne automobile.
              <br />
              <span className="font-600 text-[#1a1a1a]">Pročitaj šta drugi misle pre kupovine.</span>
            </p>

            <a
              href={CWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("add_extension")}
              className="btn-cta inline-flex items-center gap-2.5 bg-[#E5A100] text-white font-[Outfit] font-700 text-base sm:text-lg px-7 py-3.5 rounded-lg"
            >
              <Download className="w-5 h-5" />
              Preuzmi za Chrome
            </a>
          </div>

          {/* Right: Product demo */}
          <div className="flex flex-1 justify-center animate-fade-up-delay-2">
            <ProductDemo />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 py-8 bg-[#fafafa] border-y border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 md:gap-5">
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
      </div>

      {/* Features */}
      <section className="px-6 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Outfit] font-800 text-3xl sm:text-4xl text-center text-[#1a1a1a] tracking-tight mb-4">
            Zašto koristiti Polovne Komentare?
          </h2>
          <p className="font-[Outfit] text-[#6b7280] text-center max-w-2xl mx-auto mb-12">
            Kupujete polovni automobil? Pre nego što kontaktirate prodavca, pogledajte iskustva i mišljenja drugih kupaca o oglasu.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="feature-card bg-white rounded-lg p-6 pl-7">
              <MessageSquare className="w-6 h-6 text-[#E5A100] mb-3" />
              <h3 className="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Komentari na svakom oglasu</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Ostavite komentar, podelite iskustvo ili upozorite druge kupce. Svaki oglas za polovni automobil dobija prostor za diskusiju.
              </p>
            </div>

            <div className="feature-card bg-white rounded-lg p-6 pl-7">
              <Eye className="w-6 h-6 text-[#E5A100] mb-3" />
              <h3 className="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Recenzije u realnom vremenu</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Vidite šta drugi misle o ceni, stanju i opisu vozila. Komentari se prikazuju u realnom vremenu čim neko ostavi recenziju.
              </p>
            </div>

            <div className="feature-card bg-white rounded-lg p-6 pl-7">
              <ThumbsUp className="w-6 h-6 text-[#E5A100] mb-3" />
              <h3 className="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Glasanje za korisne komentare</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Najkorisnija iskustva i recenzije se ističu zahvaljujući glasovima zajednice. Glasajte za komentare koji vam pomažu.
              </p>
            </div>

            <div className="feature-card bg-white rounded-lg p-6 pl-7">
              <Shield className="w-6 h-6 text-[#E5A100] mb-3" />
              <h3 className="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Anonimno i besplatno</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Nije potrebna registracija. Komentarišite slobodno bez brige o privatnosti — ne prikupljamo lične podatke.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 lg:py-20 bg-[#fafafa] border-y border-[#e5e5e5]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-[Outfit] font-800 text-3xl sm:text-4xl text-center text-[#1a1a1a] tracking-tight mb-12">
            Česta pitanja
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Šta su Polovni Komentari?</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Polovni Komentari su besplatna Chrome ekstenzija koja dodaje komentare na oglase za polovne automobile. Pročitajte iskustva i recenzije drugih korisnika pre kupovine.
              </p>
            </div>

            <div>
              <h3 className="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Kako da koristim komentare na oglasima za polovne automobile?</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Instalirajte ekstenziju, otvorite bilo koji oglas i kliknite na narandžasto dugme sa desne strane ekrana. Odmah možete da čitate komentare i ostavljate svoja iskustva.
              </p>
            </div>

            <div>
              <h3 className="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Da li je potrebna registracija?</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Ne, komentarisanje je potpuno anonimno. Automatski dobijate nadimak koji možete promeniti. Nije potrebna ni email adresa ni bilo kakva registracija.
              </p>
            </div>

            <div>
              <h3 className="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Gde mogu da pročitam recenzije oglasa za polovne automobile?</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Instalirajte besplatnu Chrome ekstenziju Polovni Komentari i na svakom oglasu ćete videti komentare, ocene i iskustva drugih korisnika koji su pregledali isti oglas.
              </p>
            </div>

            <div>
              <h3 className="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Kako mogu da podelim iskustva o polovnim automobilima?</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Pomoću ekstenzije možete da ostavite komentar na bilo koji oglas, glasate za korisne komentare drugih korisnika, i vodite diskusiju o ceni i stanju vozila.
              </p>
            </div>

            <div>
              <h3 className="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Da li je ova ekstenzija povezana sa sajtom za polovne automobile?</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Ne. Polovni Komentari su potpuno nezavisan projekat. Nisu povezani sa, podržani od strane, niti odobreni od strane bilo kog sajta za oglašavanje vozila.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[Outfit] font-800 text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight mb-4">
            Proveri šta drugi kažu pre kupovine
          </h2>
          <p className="font-[Outfit] text-[#6b7280] mb-8">
            Instalirajte ekstenziju i odmah čitajte komentare, iskustva i recenzije na oglasima za polovne automobile.
          </p>
          <a
            href={CWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("add_extension")}
            className="btn-cta inline-flex items-center gap-2.5 bg-[#E5A100] text-white font-[Outfit] font-700 text-base sm:text-lg px-7 py-3.5 rounded-lg"
          >
            <Download className="w-5 h-5" />
            Preuzmi za Chrome
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between text-[#6b7280] text-xs border-t border-[#e5e5e5] pt-4 gap-2">
            <span>&copy; 2026 Polovni Komentari &middot; <strong>Nezavisan projekat, nije povezan sa polovniautomobili.com ili Polovni automobili doo.</strong></span>
            <div className="flex gap-3">
              <a href="/terms" className="hover:text-[#1a1a1a] transition-colors">Uslovi korišćenja</a>
              <span className="text-[#d4d4d4]">·</span>
              <a href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Politika privatnosti</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
