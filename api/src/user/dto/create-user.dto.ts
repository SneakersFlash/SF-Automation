import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { Role } from '../../auth/roles.decorator';

// USER-01: Owner buat akun Member (email + password sementara).
export class CreateUserDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @MinLength(8, { message: 'Password sementara minimal 8 karakter.' })
  password!: string;

  @IsOptional()
  @IsIn(['owner', 'member'], { message: 'Peran harus owner atau member.' })
  role?: Role;
}
