import type { BrandProfile } from '@prisma/client';

// Konteks brand ringkas yang dikirim ke OpenClaw supaya output on-brand, bukan
// template generik. Diturunkan dari BrandProfile (bukan hardcode). Dipakai
// bersama oleh CreativeService (interaktif) & ContentDropProcessor (orchestrator)
// agar keduanya konsisten on-brand.
export type BrandContext = {
  brandName: string;
  industry?: string;
  audience?: string;
  voice?: { adjectives?: string; do?: string; dont?: string };
  usp?: string;
  constraints?: string;
  ctaDestinations?: string;
  outputLanguage?: string;
  platforms?: string[];
  knowledge?: string;
  examples?: string;
};

// Map baris BrandProfile → konteks ringkas untuk LLM. Buang field kosong biar
// payload padat. Null/undefined (profil tak ada) → undefined (baseline SKILL.md).
export function buildBrandContext(
  bp: BrandProfile | null | undefined,
): BrandContext | undefined {
  if (!bp) return undefined;

  const ctx: BrandContext = { brandName: bp.brandName };
  if (bp.industry) ctx.industry = bp.industry;
  if (bp.audience) ctx.audience = bp.audience;

  const voice: NonNullable<BrandContext['voice']> = {};
  if (bp.voiceAdjectives) voice.adjectives = bp.voiceAdjectives;
  if (bp.voiceDo) voice.do = bp.voiceDo;
  if (bp.voiceDont) voice.dont = bp.voiceDont;
  if (Object.keys(voice).length) ctx.voice = voice;

  if (bp.usp) ctx.usp = bp.usp;
  if (bp.constraints) ctx.constraints = bp.constraints;
  if (bp.ctaDestinations) ctx.ctaDestinations = bp.ctaDestinations;
  if (bp.outputLanguage) ctx.outputLanguage = bp.outputLanguage;
  if (bp.platforms?.length) ctx.platforms = bp.platforms;
  if (bp.knowledge) ctx.knowledge = bp.knowledge;
  if (bp.examples) ctx.examples = bp.examples;
  return ctx;
}
