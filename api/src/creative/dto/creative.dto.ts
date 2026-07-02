import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Format brief valid (MB §8 Skill I/O: content-brief).
export const BRIEF_FORMATS = [
  'carousel',
  'story',
  'short_video',
  'static_ad',
  'long_video',
  'thread',
  'email',
  'blog',
] as const;

// CRE-01: Content Brief.
export class ContentBriefDto {
  @IsOptional() @IsString() brandProfileId?: string;

  @IsObject()
  subject!: Record<string, unknown>;

  @IsArray()
  @ArrayNotEmpty({ message: 'Pilih minimal satu format.' })
  @IsIn(BRIEF_FORMATS, { each: true, message: 'Format tidak dikenal.' })
  formats!: string[];
}

// CRE-02: Copywriting.
export class CopywritingDto {
  @IsOptional() @IsString() brandProfileId?: string;

  @IsObject()
  subject!: Record<string, unknown>;

  @IsOptional() @IsString() goal?: string;
}

// CRE-03: Humanize.
export class HumanizeDto {
  @IsString()
  @MinLength(1, { message: 'Teks wajib diisi.' })
  text!: string;

  @IsOptional() @IsString() brandProfileId?: string;
}
