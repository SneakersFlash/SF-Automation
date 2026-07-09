import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Tipe konten builder (v2). Visual → JSON prompt gen; Teks → brief teks.
export const VISUAL_TYPES = ['carousel', 'image', 'video_core', 'ads', 'feeds9'] as const;
export const TEXT_TYPES = ['story', 'short_video', 'thread', 'email', 'blog'] as const;
export const CONTENT_TYPES = [...VISUAL_TYPES, ...TEXT_TYPES] as const;

// Satu item konten yang diisi user (full per item).
export class ContentItemDto {
  @IsIn(CONTENT_TYPES, { message: 'Tipe konten tidak dikenal.' })
  contentType!: string;

  @IsString()
  @MinLength(1, { message: 'Nama produk wajib diisi.' })
  productName!: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() goal?: string; // manfaat/goal
  @IsOptional() @IsString() message?: string; // pesan
  @IsOptional() @IsString() cta?: string;
  @IsOptional() @IsString() visualStyle?: string; // gaya visual
}

// CRE-01: Content Builder — daftar item, tiap item digenerate independen.
export class ContentBriefDto {
  @IsOptional() @IsString() brandProfileId?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Tambah minimal satu konten.' })
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  items!: ContentItemDto[];
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
