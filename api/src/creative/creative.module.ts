import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CreativeController } from './creative.controller';
import { CreativeService } from './creative.service';

// Modul Creative (SRS §7.5 CRE-01..03). content-drop (CRE-04) di modul terpisah.
@Module({
  imports: [AuthModule],
  controllers: [CreativeController],
  providers: [CreativeService],
  exports: [CreativeService],
})
export class CreativeModule {}
