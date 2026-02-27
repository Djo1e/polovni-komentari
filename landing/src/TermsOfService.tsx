import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "O servisu",
    content:
      "Polovni Komentari je nezavisan projekat koji dodaje komentare na stranice oglasa na polovniautomobili.com. Nije povezan sa, podržan od strane, niti odobren od strane polovniautomobili.com ili Polovni automobili doo.",
  },
  {
    title: "Korisnički sadržaj",
    items: [
      "Korisnici su odgovorni za sadržaj koji postavljaju.",
      "Zabranjeni su: govor mržnje, spam, nezakonit sadržaj, lični napadi i deljenje ličnih podataka drugih lica.",
      "Zadržavamo pravo da uklonimo bilo koji komentar bez prethodnog obaveštenja.",
    ],
  },
  {
    title: "Odricanje od odgovornosti",
    items: [
      "Servis se pruža \"kakav jeste\" bez ikakvih garancija.",
      "Ne garantujemo dostupnost, tačnost ili pouzdanost servisa.",
      "Servis može biti izmenjen ili ukinut u bilo kom trenutku bez prethodnog obaveštenja.",
    ],
  },
  {
    title: "Ograničenje odgovornosti",
    content:
      "Ni u kom slučaju nećemo biti odgovorni za bilo kakvu direktnu, indirektnu, slučajnu ili posledičnu štetu nastalu korišćenjem ovog servisa.",
  },
  {
    title: "Privatnost",
    content:
      "Korišćenjem servisa prihvatate našu Politiku privatnosti. Za više informacija posetite stranicu /privacy.",
  },
  {
    title: "Merodavno pravo",
    content: "Na ove Uslove korišćenja primenjuje se pravo Republike Srbije.",
  },
] as const;

const sectionsEn = [
  {
    title: "About the service",
    content:
      "Polovni Komentari is an independent project that adds comments to listing pages on polovniautomobili.com. It is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.",
  },
  {
    title: "User content",
    items: [
      "Users are responsible for the content they post.",
      "Prohibited: hate speech, spam, illegal content, personal attacks, and sharing personal information of others.",
      "We reserve the right to remove any comment without prior notice.",
    ],
  },
  {
    title: "Disclaimer of warranties",
    items: [
      'The service is provided "as is" without any warranties.',
      "We do not guarantee availability, accuracy, or reliability of the service.",
      "The service may be modified or discontinued at any time without prior notice.",
    ],
  },
  {
    title: "Limitation of liability",
    content:
      "In no event shall we be liable for any direct, indirect, incidental, or consequential damages arising from the use of this service.",
  },
  {
    title: "Privacy",
    content:
      "By using the service you accept our Privacy Policy. For more information visit /privacy.",
  },
  {
    title: "Governing law",
    content:
      "These Terms of Service are governed by the laws of the Republic of Serbia.",
  },
] as const;

function SectionList({ data }: { data: typeof sections | typeof sectionsEn }) {
  return (
    <div className="space-y-8">
      {data.map((section) => (
        <div key={section.title}>
          <h2 className="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">
            {section.title}
          </h2>
          {"content" in section && (
            <p className="text-[#6b7280] text-sm leading-relaxed">
              {section.content}
            </p>
          )}
          {"items" in section && (
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="text-[#6b7280] text-sm leading-relaxed flex gap-2"
                >
                  <span className="text-[#E5A100] shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 bg-[#E5A100]" />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Nazad
        </a>

        <h1 className="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">
          Uslovi korišćenja
        </h1>
        <p className="text-[#6b7280] text-sm mb-10">
          Poslednje ažuriranje: 27. februar 2026.
        </p>

        <SectionList data={sections} />

        <div className="mt-16 pt-8 border-t border-[#e5e5e5]">
          <h1 className="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">
            Terms of Service
          </h1>
          <p className="text-[#6b7280] text-sm mb-10">
            Last updated: February 27, 2026
          </p>

          <SectionList data={sectionsEn} />
        </div>

        <div className="mt-12 pt-6 border-t border-[#e5e5e5] text-[#6b7280] text-xs">
          &copy; 2026 Polovni Komentari
        </div>
      </div>
    </div>
  );
}
