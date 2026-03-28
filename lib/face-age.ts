export type AgeEstimateResult = {
  estimatedAge: number;
  confidence: number;
  isLikelyAdult: boolean;
  provider: string;
  raw?: unknown;
  disclaimer: string;
};

type LabelScore = {
  label?: string;
  score?: number;
};

const HF_DEFAULT_MODEL =
  process.env.HF_AGE_MODEL_URL ??
  'https://api-inference.huggingface.co/models/nateraw/vit-age-classifier';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseAgeLabel(label: string): number | null {
  const clean = label.trim();

  // common forms: "0-2", "20-29", "60+", "<13"
  const range = clean.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})/);
  if (range) {
    const lo = Number(range[1]);
    const hi = Number(range[2]);
    if (!Number.isNaN(lo) && !Number.isNaN(hi) && hi >= lo) {
      return Math.round((lo + hi) / 2);
    }
  }

  const plus = clean.match(/(\d{1,2})\s*\+/);
  if (plus) {
    const base = Number(plus[1]);
    if (!Number.isNaN(base)) return base + 3;
  }

  const lt = clean.match(/<\s*(\d{1,2})/);
  if (lt) {
    const v = Number(lt[1]);
    if (!Number.isNaN(v)) return Math.max(1, v - 2);
  }

  const single = clean.match(/\b(\d{1,2})\b/);
  if (single) {
    const v = Number(single[1]);
    if (!Number.isNaN(v)) return v;
  }

  return null;
}

function estimateFromHash(imageBytes: Uint8Array): AgeEstimateResult {
  // deterministic prototype fallback when external inference is unavailable
  let hash = 0;
  const step = Math.max(1, Math.floor(imageBytes.length / 256));
  for (let i = 0; i < imageBytes.length; i += step) {
    hash = (hash * 31 + imageBytes[i]) >>> 0;
  }

  const estimatedAge = 15 + (hash % 23); // 15..37
  const confidence = 0.22;

  return {
    estimatedAge,
    confidence,
    isLikelyAdult: estimatedAge >= 18,
    provider: 'prototype-hash-fallback',
    disclaimer:
      'Prototype estimate only. This fallback is NOT reliable for legal/compliance age verification.',
  };
}

async function estimateFromHuggingFace(imageBytes: Uint8Array, mimeType: string): Promise<AgeEstimateResult | null> {
  const headers: Record<string, string> = {
    'Content-Type': mimeType,
  };

  if (process.env.HF_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.HF_API_TOKEN}`;
  }

  const response = await fetch(HF_DEFAULT_MODEL, {
    method: 'POST',
    headers,
    body: Buffer.from(imageBytes),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) return null;

  const rows = payload
    .map((row) => row as LabelScore)
    .filter((r) => typeof r.label === 'string' && typeof r.score === 'number')
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  if (rows.length === 0) return null;

  const top = rows[0];
  const parsedAge = parseAgeLabel(top.label ?? '');
  if (parsedAge == null) return null;

  const estimatedAge = clamp(parsedAge, 1, 99);
  const confidence = clamp(Number(top.score ?? 0), 0, 1);

  return {
    estimatedAge,
    confidence,
    isLikelyAdult: estimatedAge >= 18,
    provider: 'huggingface-vit-age-classifier',
    raw: {
      topLabel: top.label,
      topScore: top.score,
    },
    disclaimer:
      'Prototype estimate only. Not sufficient for legal/compliance age verification.',
  };
}

export async function estimateAgeFromFaceImage(imageBytes: Uint8Array, mimeType: string): Promise<AgeEstimateResult> {
  try {
    const hf = await estimateFromHuggingFace(imageBytes, mimeType);
    if (hf) return hf;
  } catch {
    // ignore and fallback
  }

  return estimateFromHash(imageBytes);
}
