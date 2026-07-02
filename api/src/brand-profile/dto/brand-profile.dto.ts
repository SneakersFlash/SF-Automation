import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// BRAND-01/02 — field profile (SRS §7.3, schema BrandProfile).
export class CreateBrandProfileDto {
  @IsString()
  @MinLength(1, { message: 'Nama brand wajib diisi.' })
  brandName!: string;

  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() audience?: string;
  @IsOptional() @IsString() voiceAdjectives?: string;
  @IsOptional() @IsString() voiceDo?: string;
  @IsOptional() @IsString() voiceDont?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional() @IsString() outputLanguage?: string;
  @IsOptional() @IsString() visualAssets?: string;
  @IsOptional() @IsString() usp?: string;
  @IsOptional() @IsString() ctaDestinations?: string;
  @IsOptional() @IsString() constraints?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

// PATCH — semua opsional.
export class UpdateBrandProfileDto {
  @IsOptional() @IsString() @MinLength(1) brandName?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() audience?: string;
  @IsOptional() @IsString() voiceAdjectives?: string;
  @IsOptional() @IsString() voiceDo?: string;
  @IsOptional() @IsString() voiceDont?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional() @IsString() outputLanguage?: string;
  @IsOptional() @IsString() visualAssets?: string;
  @IsOptional() @IsString() usp?: string;
  @IsOptional() @IsString() ctaDestinations?: string;
  @IsOptional() @IsString() constraints?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
