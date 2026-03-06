import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Shield, Loader2, AlertTriangle, CheckCircle, Clock, RotateCcw } from "lucide-react";
import { trackEvent } from "../utils/tracking";

interface Props {
  vin: string;
  boughtNewInSerbia: boolean;
}

function parseAbsResponse(html: string): { found: boolean; statusLines: string[] } {
  if (html.includes("не постоји у бази")) {
    return { found: false, statusLines: [] };
  }

  if (!html.includes("постоји у бази")) {
    return { found: false, statusLines: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const lines: string[] = [];
  const resultDivs = Array.from(doc.querySelectorAll("div.my-3"));
  for (const div of resultDivs) {
    const text = div.textContent?.trim() ?? "";
    if (text.includes("постоји у бази")) {
      const parts = div.innerHTML.split(/<br\s*\/?>/i);
      for (const part of parts) {
        const tmp = document.createElement("span");
        tmp.innerHTML = part;
        const line = tmp.textContent?.trim();
        if (line && /^\d{2}\.\d{2}\.\d{4}/.test(line)) {
          lines.push(line);
        }
      }
      break;
    }
  }

  return { found: true, statusLines: lines };
}

function isApproved(statusLines: string[]): boolean {
  return statusLines.some((l) => l.includes("одобри") || l.includes("регистров"));
}

function getLatestDate(statusLines: string[]): string | null {
  for (let i = statusLines.length - 1; i >= 0; i--) {
    const match = statusLines[i].match(/\d{2}\.\d{2}\.\d{4}/);
    if (match) return match[0];
  }
  return null;
}

export function VinCheck({ vin, boughtNewInSerbia }: Props) {
  const cached = useQuery(api.vinChecks.getByVin, { vin });
  const saveCheck = useMutation(api.vinChecks.saveCheck);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localResult, setLocalResult] = useState<{ found: boolean; statusLines: string[] } | null>(null);

  const result = cached ?? localResult;

  async function handleCheck() {
    trackEvent("vin_check");
    setLoading(true);
    setError(null);
    try {
      const resp: { ok: boolean; html?: string; error?: string } = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "ABS_VIN_CHECK", vin }, resolve);
      });
      if (!resp.ok) throw new Error(resp.error);
      const parsed = parseAbsResponse(resp.html!);
      setLocalResult(parsed);
      await saveCheck({ vin, ...parsed });
    } catch {
      setError("Greška pri proveri. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (!result && !loading && !error) {
    return (
      <div className="px-5 py-3 border-b border-border">
        <button
          onClick={handleCheck}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-[14px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border-solid border border-blue-200"
        >
          <Shield className="h-4 w-4" />
          Proveri broj šasije
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-5 py-3 border-b border-border flex items-center justify-center gap-2 text-[14px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Provera u toku…
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-red-500">{error}</span>
          <button
            onClick={handleCheck}
            className="flex items-center gap-1 text-[13px] text-blue-500 hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Ponovo
          </button>
        </div>
      </div>
    );
  }

  if (result && !result.found) {
    if (boughtNewInSerbia) {
      return (
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2.5">
            <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-[14px] text-green-700 font-medium leading-snug">
              Nije pronađeno u ABS bazi. Očekivano za vozilo kupljeno novo u Srbiji
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[14px] text-gray-400">
          <Shield className="h-4 w-4 inline mr-1 align-text-bottom" />
          Nije pronađeno u ABS bazi
        </p>
      </div>
    );
  }

  if (result && result.found) {
    const approved = isApproved(result.statusLines);
    const date = getLatestDate(result.statusLines);

    if (boughtNewInSerbia) {
      return (
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-start gap-2 rounded-md bg-orange-50 border border-orange-200 px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] text-orange-700 font-medium leading-snug">
                Oglas navodi da je kupljen nov u Srbiji, ali je vozilo pronađeno u bazi uvezenih vozila
              </p>
              {result.statusLines.length > 0 && (
                <ul className="mt-1.5 text-[13px] text-orange-600 list-none p-0 m-0 space-y-0.5">
                  {result.statusLines.map((line: string, i: number) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (approved) {
      return (
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2.5">
            <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] text-green-700 font-medium leading-snug">
                Uvezeno i odobreno{date ? ` (${date})` : ""}
              </p>
              {result.statusLines.length > 0 && (
                <ul className="mt-1.5 text-[13px] text-green-600 list-none p-0 m-0 space-y-0.5">
                  {result.statusLines.map((line: string, i: number) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-5 py-3 border-b border-border">
        <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2.5">
          <Clock className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] text-yellow-700 font-medium leading-snug">
              Postupak uvoza u toku
            </p>
            {result.statusLines.length > 0 && (
              <ul className="mt-1.5 text-[13px] text-yellow-600 list-none p-0 m-0 space-y-0.5">
                {result.statusLines.map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
