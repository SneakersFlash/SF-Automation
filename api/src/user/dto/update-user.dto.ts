import { IsBoolean } from 'class-validator';

// USER-02: aktif/nonaktif Member.
export class UpdateUserDto {
  @IsBoolean()
  isActive!: boolean;
}
