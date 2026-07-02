import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdActionDto, GenerateAdsDto } from './dto/ads.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

// ADS-01..04 (IA §7). Approve/reject = Owner only.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ads')
export class AdsController {
  constructor(private readonly ads: AdsService) {}

  @Post('generate')
  generate(@Body() dto: GenerateAdsDto, @CurrentUser() user: AuthUser) {
    return this.ads.generate(dto, user.id);
  }

  @Get('performance')
  performance(@Query('from') from?: string, @Query('to') to?: string) {
    return this.ads.performance(from, to);
  }

  @Get('actions')
  listActions() {
    return this.ads.listActions();
  }

  @Post('actions')
  createAction(@Body() dto: CreateAdActionDto) {
    return this.ads.createAction(dto);
  }

  @Post('actions/:id/approve')
  @Roles('owner')
  approve(
    @Param('id') id: string,
    @Query('confirm') confirm: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ads.approve(id, user.id, confirm === 'true');
  }

  @Post('actions/:id/reject')
  @Roles('owner')
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.ads.reject(id, user.id);
  }
}
