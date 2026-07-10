import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OpenclawService } from '../openclaw/openclaw.service';
import { buildBrandContext, type BrandContext } from '../brand-profile/brand-context';
import type {
  ContentBriefDto,
  ContentItemDto,
  CopywritingDto,
  HumanizeDto,
} from './dto/creative.dto';

// Hasil generate satu item (unified: visual pakai assets+copy, teks pakai brief).
type GenResult = Record<string, unknown> & {
  kind?: string;
  brief?: unknown;
  copy?: Record<string, unknown>;
};

// CRE-01..03 — panggil skill via OpenClaw Gateway, catat Generation (AUD-01).
@Injectable()
export class CreativeService {
  private readonly log = new Logger(CreativeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openclaw: OpenclawService,
  ) {}

  // CRE-01 — Content Builder: tiap item digenerate independen (paralel).
  async contentBrief(dto: ContentBriefDto, userId: string) {
    const brand = await this.loadBrandContext(dto.brandProfileId);
    const results = await Promise.all(
      dto.items.map((item) => this.generateItem(brand, item)),
    );
    await this.logGeneration(
      'content-brief',
      { brand, items: dto.items },
      { results },
      userId,
      dto.brandProfileId,
    );
    return { results };
  }

  private async generateItem(
    brand: BrandContext | undefined,
    item: ContentItemDto,
  ): Promise<GenResult> {
    const raw = await this.openclaw.run<GenResult>('content-brief', { brand, item });
    return this.humanizeResult(raw, brand);
  }

  // Humanize hanya field prosa: brief (teks) atau copy.caption (visual).
  // image_prompt/negative_prompt JANGAN disentuh.
  private async humanizeResult(
    result: GenResult,
    brand?: BrandContext,
  ): Promise<GenResult> {
    if (!result || typeof result !== 'object') return result;

    if (result.kind === 'text' && typeof result.brief === 'string') {
      return {
        ...result,
        brief: await this.softHumanize(result.brief, brand, { preserveStructure: true }),
      };
    }

    const copy = result.copy;
    if (copy && typeof copy === 'object' && typeof copy.caption === 'string') {
      return {
        ...result,
        copy: { ...copy, caption: await this.softHumanize(copy.caption, brand) },
      };
    }
    return result;
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
    let bp = brandProfileId
      ? await this.prisma.brandProfile.findUnique({ where: { id: brandProfileId } })
      : await this.prisma.brandProfile.findFirst({ where: { isDefault: true } });
    // brandProfileId basi/terhapus → jangan diam-diam jadi tanpa brand;
    // jatuh ke profil default supaya output tetap on-brand.
    if (!bp && brandProfileId) {
      bp = await this.prisma.brandProfile.findFirst({ where: { isDefault: true } });
    }
    return buildBrandContext(bp);
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

  // Copywriting: perhalus caption (blok prosa paling rawan robotik).
  private async humanizeCopy(
    output: Record<string, unknown>,
    brand?: BrandContext,
  ): Promise<Record<string, unknown>> {
    if (typeof output?.caption !== 'string') return output;
    return { ...output, caption: await this.softHumanize(output.caption, brand) };
  }

  private async logGeneration(
    skill: string,
    input: unknown,
    output: unknown,
    userId: string,
    brandProfileId?: string,
  ) {
    const base = {
      skill,
      userId,
      input: input as Prisma.InputJsonValue,
      output: output as Prisma.InputJsonValue,
      status: 'done',
    };
    try {
      return await this.prisma.generation.create({ data: { ...base, brandProfileId } });
    } catch (e) {
      // brandProfileId basi/terhapus → FK violation. Jangan gagalkan request user;
      // simpan audit tanpa link brand.
      this.log.warn(`Log generation gagal (retry tanpa brandProfileId): ${String(e)}`);
      return this.prisma.generation.create({ data: base });
    }
  }
}
