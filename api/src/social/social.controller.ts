import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { ConnectAccountDto } from './dto/social.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// SOC-01..03 (IA §7): connect/disconnect = Owner; lihat performa = Owner+Member.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Get('accounts')
  listAccounts(@Query('brandProfileId') brandProfileId?: string) {
    return this.social.listAccounts(brandProfileId);
  }

  @Post('accounts/connect/:platform')
  @Roles('owner')
  connect(@Param('platform') platform: string, @Body() dto: ConnectAccountDto) {
    return this.social.connect(platform, dto);
  }

  @Delete('accounts/:id')
  @Roles('owner')
  disconnect(@Param('id') id: string) {
    return this.social.disconnect(id);
  }

  @Get('performance')
  performance(
    @Query('brandProfileId') brandProfileId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.social.performance(brandProfileId, from, to);
  }
}
