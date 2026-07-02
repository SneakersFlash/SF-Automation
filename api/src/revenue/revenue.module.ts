import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { GineeService } from './ginee.service';

// Modul Revenue (SRS §7.8 REV-01..03) via Ginee OpenAPI.
@Module({
  imports: [AuthModule],
  controllers: [RevenueController],
  providers: [RevenueService, GineeService],
})
export class RevenueModule {}
