import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';

// Modul Ads (SRS §7.6 ADS-01..04).
@Module({
  imports: [AuthModule],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
