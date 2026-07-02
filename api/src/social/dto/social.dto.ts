import { IsOptional, IsString, MinLength } from 'class-validator';

// SOC-01: connect akun IG/TikTok per Brand Profile.
// tokenRef = referensi secret (JANGAN simpan token plain — Golden Rule #5).
export class ConnectAccountDto {
  @IsString() @MinLength(1) brandProfileId!: string;
  @IsString() @MinLength(1) accountId!: string;
  @IsString() @MinLength(1) tokenRef!: string;
  @IsOptional() @IsString() handle?: string;
}
