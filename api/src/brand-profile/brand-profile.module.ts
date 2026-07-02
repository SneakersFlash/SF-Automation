import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BrandProfileController } from './brand-profile.controller';
import { BrandProfileService } from './brand-profile.service';

// Modul Brand Profile (SRS §7.3 BRAND-01..05).
@Module({
  imports: [AuthModule],
  controllers: [BrandProfileController],
  providers: [BrandProfileService],
  exports: [BrandProfileService],
})
export class BrandProfileModule {}
