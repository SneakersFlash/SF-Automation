import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OpenclawService } from '../openclaw/openclaw.service';
import type { ContentBriefDto, CopywritingDto, HumanizeDto } from './dto/creative.dto';

// CRE-01..03 — panggil skill via OpenClaw Gateway, catat Generation (AUD-01).
@Injectable()
export class CreativeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openclaw: OpenclawService,
  ) {}

  async contentBrief(dto: ContentBriefDto, userId: string) {
    const output = await this.openclaw.run<{ briefs: Record<string, string> }>(
      'content-brief',
      { subject: dto.subject, formats: dto.formats },
    );
    await this.logGeneration('content-brief', dto, output, userId, dto.brandProfileId);
    return output;
  }

  async copywriting(dto: CopywritingDto, userId: string) {
    const output = await this.openclaw.run<Record<string, unknown>>('copywriting', {
      subject: dto.subject,
      goal: dto.goal,
    });
    await this.logGeneration('copywriting', dto, output, userId, dto.brandProfileId);
    return output;
  }

  // Humanize = teks bebas (bukan JSON). Bungkus jadi { text }.
  async humanize(dto: HumanizeDto, userId: string) {
    const text = await this.openclaw.chat(
      `Jalankan skill "humanize" pada teks berikut, balas teks natural saja:\n${dto.text}`,
    );
    const output = { text: text.trim() };
    await this.logGeneration('humanize', dto, output, userId, dto.brandProfileId);
    return output;
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
