import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

// SUBJ-01: produk/campaign. details = { sku, colorway, price, dropType, specs }.
export class CreateSubjectDto {
  @IsString()
  @MinLength(1, { message: 'Nama subject wajib diisi.' })
  name!: string;

  @IsOptional() @IsString() brandProfileId?: string;
  @IsOptional() @IsString() goal?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}
