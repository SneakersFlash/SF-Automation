import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OpenclawService } from '../openclaw/openclaw.service';
import type { ContentBriefDto, CopywritingDto, HumanizeDto } from './dto/creative.dto';

// Konteks brand ringkas yang dikirim ke OpenClaw supaya output on-brand,
// bukan template generik. Diturunkan dari BrandProfile di DB (bukan hardcode).
type BrandContext = {
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

// CRE-01..03 — panggil skill via OpenClaw Gateway, catat Generation (AUD-01).
@Injectable()
export class CreativeService {
  private readonly log = new Logger(CreativeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openclaw: OpenclawService,
  ) {}

  async contentBrief(dto: ContentBriefDto, userId: string) {
    const brand = await this.loadBrandContext(dto.brandProfileId);
    const payload = { brand, subject: dto.subject, formats: dto.formats };
    const raw = await this.openclaw.run<{ briefs: Record<string, string> }>(
      'content-brief',
      payload,
    );
    const output = await this.humanizeBriefs(raw, brand);
    await this.logGeneration('content-brief', payload, output, userId, dto.brandProfileId);
    return output;
  }

  async copywriting(dto: CopywritingDto, userId: string) {
    const brand = await this.loadBrandContext(dto.brandProfileId);
    const payload = { brand, subject: dto.subject, goal: dto.goal };
    const raw = await this.openclaw.run<Record<string, unknown>>('copywriting', payload);
    const output = await this.humanizeCopy(raw, brand);
    await this.logGeneration('copywriting', payload, output, userId, dto.brandProfileId);
    return output;
  }

  // Humanize = teks bebas (bukan JSON). Bungkus jadi { text }.
  async humanize(dto: HumanizeDto, userId: string) {
    const brand = await this.loadBrandContext(dto.brandProfileId);
    const text = await this.softHumanize(dto.text, brand);
    const output = { text: text.trim() };
    await this.logGeneration('humanize', dto, output, userId, dto.brandProfileId);
    return output;
  }

  // Ambil BrandProfile → objek konteks ringkas untuk LLM. Kalau brandProfileId
  // kosong, pakai profil default. Buang field kosong biar payload padat.
  private async loadBrandContext(
    brandProfileId?: string,
  ): Promise<BrandContext | undefined> {
    const bp = brandProfileId
      ? await this.prisma.brandProfile.findUnique({ where: { id: brandProfileId } })
      : await this.prisma.brandProfile.findFirst({ where: { isDefault: true } });
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

  // Pass akhir buang nada robotik. GUARDED: kalau gateway gagal/timeout,
  // kembalikan teks asli (jangan blokir request utama).
  private async softHumanize(
    text: string,
    brand?: BrandContext,
    opts: { preserveStructure?: boolean } = {},
  ): Promise<string> {
    if (!text || !text.trim()) return text;
    const voice = brand?.voice ? `Voice brand: ${JSON.stringify(brand.voice)}. ` : '';
    const guard = opts.preserveStructure
      ? 'PERTAHANKAN struktur & label (CAPS + dash) dan semua fakta; hanya perhalus bahasa biar natural & tidak robotik. '
      : 'Perhalus jadi natural, on-brand, tidak robotik; pertahankan fakta (harga/size/CTA). ';
    try {
      const out = await this.openclaw.chat(
        `Jalankan skill "humanize" pada teks berikut. ${voice}${guard}Balas TEKS hasil saja:\n${text}`,
        { agentId: 'sf-humanize' },
      );
      return out.trim() || text;
    } catch (e) {
      this.log.warn(`Humanize pass gagal, pakai teks asli: ${String(e)}`);
      return text;
    }
  }

  // Perhalus tiap brief per-format (paralel), pertahankan struktur label.
  private async humanizeBriefs(
    output: { briefs: Record<string, string> },
    brand?: BrandContext,
  ): Promise<{ briefs: Record<string, string> }> {
    if (!output?.briefs) return output;
    const entries = Object.entries(output.briefs);
    const humanized = await Promise.all(
      entries.map(
        async ([fmt, text]) =>
          [fmt, await this.softHumanize(text, brand, { preserveStructure: true })] as const,
      ),
    );
    return { ...output, briefs: Object.fromEntries(humanized) };
  }

  // Copywriting: perhalus caption (blok prosa paling rawan robotik).
  private async humanizeCopy(
    output: Record<string, unknown>,
    brand?: BrandContext,
  ): Promise<Record<string, unknown>> {
    if (typeof output?.caption !== 'string') return output;
    return { ...output, caption: await this.softHumanize(output.caption, brand) };
  }

  private logGeneration(
    skill: string,
    input: unknown,
    output: unknown,
    userId: string,
    brandProfileId?: string,
  ) {
    return this.prisma.generation.create({
      data: {
        skill,
        brandProfileId,
        userId,
        input: input as Prisma.InputJsonValue,
        output: output as Prisma.InputJsonValue,
        status: 'done',
      },
    });
  }
}
