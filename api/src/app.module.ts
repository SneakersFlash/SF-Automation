import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BrandProfileModule } from './brand-profile/brand-profile.module';
import { SubjectModule } from './subject/subject.module';
import { CreativeModule } from './creative/creative.module';
import { AdsModule } from './ads/ads.module';
import { SocialModule } from './social/social.module';
import { RevenueModule } from './revenue/revenue.module';
import { AuditModule } from './audit/audit.module';
import { OpenclawModule } from './openclaw/openclaw.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { ImageGenModule } from './creative/image-gen/image-gen.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    BrandProfileModule,
    SubjectModule,
    CreativeModule,
    AdsModule,
    SocialModule,
    RevenueModule,
    AuditModule,
    OpenclawModule,
    OrchestratorModule,
    ImageGenModule,
  ],
})
export class AppModule {}
