import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RevenueService } from './revenue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

// REV-01..03 (IA §7): Owner + Member. Cache = webhook bearer (tanpa JWT).
@Controller('revenue')
export class RevenueController {
  constructor(
    private readonly revenue: RevenueService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  get(@Query('date') date?: string) {
    return this.revenue.get(date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('refresh')
  refresh(@Query('date') date?: string) {
    return this.revenue.refresh(date);
  }

  // Webhook: diamankan dengan bearer secret, bukan sesi user.
  @Post('cache')
  cache(
    @Headers('authorization') auth: string,
    @Body() payload: { date: string; data: Record<string, unknown> },
  ) {
    const secret = this.config.get<string>('REVENUE_CACHE_WEBHOOK_SECRET');
    if (!secret || auth !== `Bearer ${secret}`) {
      throw new UnauthorizedException('Webhook token salah.');
    }
    return this.revenue.cache(payload);
  }
}
