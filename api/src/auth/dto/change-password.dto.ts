import { IsString, MinLength } from 'class-validator';

// UF-02 Change Password.
export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Password lama wajib diisi.' })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'Password baru minimal 8 karakter.' })
  newPassword!: string;
}
