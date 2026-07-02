import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { ContentDropService } from './content-drop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

class ContentDropDto {
  @IsString()
  @MinLength(1, { message: 'subjectId wajib diisi.' })
  subjectId!: string;
}

// CRE-04 (IA §7): Owner + Member. Endpoint di bawah /api/creative/content-drop.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('creative/content-drop')
export class ContentDropController {
  constructor(private readonly drop: ContentDropService) {}

  @Post()
  start(@Body() dto: ContentDropDto, @CurrentUser() user: AuthUser) {
    return this.drop.start(dto.subjectId, user.id);
  }

  @Get(':packId')
  get(@Param('packId') packId: string) {
    return this.drop.get(packId);
  }
}
