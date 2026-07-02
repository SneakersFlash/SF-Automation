import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

// Modul Social Performance (SRS §7.7 SOC-01..03).
@Module({
  imports: [AuthModule],
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}
