import { IsObject, IsOptional, IsString } from 'class-validator';

// ADS-01: generate 4 ad concept.
export class GenerateAdsDto {
  @IsOptional() @IsString() brandProfileId?: string;

  @IsObject()
  subject!: Record<string, unknown>;
}

// ADS-03: ajukan aksi publish/scale (status pending_approval).
export class CreateAdActionDto {
  @IsString() type!: string; // publish | scale

  @IsObject()
  payload!: Record<string, unknown>; // { adVariantId?, budget?, prevBudget?, ... }
}
