import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "O ekstenziji",
    content:
      "Polovni Komentari su nezavisan projekat i nisu povezani sa, podržani od strane, niti odobreni od strane polovniautomobili.com ili Polovni automobili doo.",
  },
  {
    title: "Šta radi ova ekstenzija",
    content:
      "Polovni Komentari dodaje sekciju za komentare na stranice oglasa na polovniautomobili.com. Korisnici mogu da ostavljaju komentare, odgovaraju drugima i glasaju za komentare. Ekstenzija takođe omogućava proveru statusa uvoza vozila preko javne ABS baze.",
  },
  {
    title: "Podaci koje prikupljamo",
    items: [
      "Anonimni identifikator — nasumično generisan ID koji se čuva u lokalnoj memoriji vašeg pregledača. Nije povezan sa vašim stvarnim identitetom.",
      "Nadimak — automatski generisan (npr. \"Golf123\") ili po vašem izboru. Čuva se u lokalnoj memoriji pregledača.",
      "Komentari i glasovi — tekst koji postavljate i glasovi koje dajete se šalju na naš server i vidljivi su svim korisnicima ekstenzije.",
      "Rezultati provere VIN broja — kada koristite opciju provere broja šasije, VIN se šalje na abs.gov.rs (javni servis Agencije za bezbednost saobraćaja). Rezultat se čuva na našem serveru kako bi naredne provere istog VIN-a bile trenutne.",
    ],
  },
  {
    title: "Podaci koje NE prikupljamo",
    items: [
      "Nikakve lične podatke (ime, email, telefon, itd.)",
      "Istoriju pretraživanja",
      "Sadržaj stranica sa polovniautomobili.com",
      "Kolačiće ili piksele za praćenje",
      "Analitiku ili telemetriju",
    ],
  },
  {
    title: "Gde se podaci čuvaju",
    items: [
      "Lokalni podaci (anonimni ID, nadimak, podešavanja) se čuvaju u vašem pregledaču koristeći localStorage na domenu polovniautomobili.com.",
      "Komentari i glasovi se čuvaju na Convex (convex.dev), cloud bazi podataka.",
    ],
  },
  {
    title: "Dozvole",
    content:
      "Ova ekstenzija zahteva pristup sajtu abs.gov.rs isključivo za funkciju provere broja šasije. Nisu potrebne druge posebne dozvole pregledača.",
  },
  {
    title: "Servisi trećih strana",
    content:
      "Koristimo Convex (convex.dev) za čuvanje i prikazivanje komentara, glasova i keširanih rezultata provere VIN-a. Politika privatnosti Convex-a se odnosi na podatke koji se čuvaju na njihovim serverima. Funkcija provere VIN-a koristi abs.gov.rs, javni servis Agencije za bezbednost saobraćaja. Zahtev se šalje samo kada korisnik klikne na dugme za proveru.",
  },
  {
    title: "Brisanje podataka",
    items: [
      "Da biste obrisali lokalne podatke, obrišite podatke sajta za polovniautomobili.com u podešavanjima pregledača.",
      "Komentari i glasovi su javni i trenutno ih korisnici ne mogu sami obrisati. Kontaktirajte nas ako želite da uklonite komentar.",
    ],
  },
  {
    title: "Čuvanje podataka",
    content:
      "Komentari i glasovi se čuvaju neograničeno osim ako se ne zatraži brisanje. Osnovni podaci o oglasu (naslov, cena, URL slike) se čuvaju kako bi se prikazali u fidu najnovijih komentara. Ovi podaci su javno dostupni na polovniautomobili.com.",
  },
] as const;

const sectionsEn = [
  {
    title: "About this extension",
    content:
      "Polovni Komentari is an independent project and is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.",
  },
  {
    title: "What this extension does",
    content:
      "Polovni Komentari adds a community comment section to car listing pages on polovniautomobili.com. Users can post comments, reply to others, and vote on comments. The extension also allows users to check vehicle import status via the public VIN lookup provided by Serbia's Agency for Traffic Safety (ABS).",
  },
  {
    title: "Data we collect",
    items: [
      "Anonymous identifier — a randomly generated ID stored in your browser's local storage. Not linked to your real identity.",
      "Username — either auto-generated (e.g. \"Golf123\") or chosen by you. Stored in your browser's local storage.",
      "Comments and votes — text you post and votes you cast are sent to our server and visible to all users of the extension.",
      "VIN check results — when you use the VIN check feature, the chassis number (VIN) from the listing is sent to abs.gov.rs (a public government service) to check vehicle import status. The result is cached on our server so that subsequent checks for the same VIN load instantly.",
    ],
  },
  {
    title: "Data we do NOT collect",
    items: [
      "No personal information (name, email, phone, etc.)",
      "No browsing history",
      "No page content from polovniautomobili.com",
      "No cookies or tracking pixels",
      "No analytics or telemetry",
    ],
  },
  {
    title: "Where data is stored",
    items: [
      "Local data (anonymous ID, username, preferences) is stored in your browser using localStorage on the polovniautomobili.com domain.",
      "Comments and votes are stored on Convex (convex.dev), a cloud database service.",
    ],
  },
  {
    title: "Permissions",
    content: "This extension requests host access to abs.gov.rs solely for the VIN check feature. No other special browser permissions are required.",
  },
  {
    title: "Third-party services",
    content:
      "We use Convex (convex.dev) to store and serve comments, votes, and cached VIN check results. Convex's privacy policy applies to data stored on their servers. The VIN check feature queries abs.gov.rs, a public service of Serbia's Agency for Traffic Safety. This request is only made when the user clicks the check button.",
  },
  {
    title: "Data deletion",
    items: [
      "To delete your local data, clear your browser's site data for polovniautomobili.com.",
      "Comments and votes are public and cannot currently be deleted by users. Contact us if you need a comment removed.",
    ],
  },
  {
    title: "Data retention",
    content:
      "Comments and votes are retained indefinitely unless deletion is requested. Basic listing data (title, price, image URL) is stored to display in the latest comments feed. This data is publicly available on polovniautomobili.com.",
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

export default function PrivacyPolicy() {
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
          Politika privatnosti
        </h1>
        <p className="text-[#6b7280] text-sm mb-10">
          Poslednje ažuriranje: 4. mart 2026.
        </p>

        <SectionList data={sections} />

        <div className="mt-16 pt-8 border-t border-[#e5e5e5]">
          <h1 className="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">
            Privacy Policy
          </h1>
          <p className="text-[#6b7280] text-sm mb-10">
            Last updated: March 4, 2026
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
