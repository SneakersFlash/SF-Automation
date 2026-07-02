import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreativeService } from './creative.service';
import {
  ContentBriefDto,
  CopywritingDto,
  HumanizeDto,
} from './dto/creative.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

// CRE-01..03 (IA §7): Owner + Member. Semua di bawah /api/creative.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('creative')
export class CreativeController {
  constructor(private readonly creative: CreativeService) {}

  @Post('content-brief')
  contentBrief(@Body() dto: ContentBriefDto, @CurrentUser() user: AuthUser) {
    return this.creative.contentBrief(dto, user.id);
  }

  @Post('copywriting')
  copywriting(@Body() dto: CopywritingDto, @CurrentUser() user: AuthUser) {
    return this.creative.copywriting(dto, user.id);
  }

  @Post('humanize')
  humanize(@Body() dto: HumanizeDto, @CurrentUser() user: AuthUser) {
    return this.creative.humanize(dto, user.id);
  }
}
