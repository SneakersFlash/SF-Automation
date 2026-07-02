import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ContentDropController } from './content-drop.controller';
import { ContentDropService, CONTENT_DROP_QUEUE } from './content-drop.service';
import { ContentDropProcessor } from './content-drop.processor';

// CRE-04 Orchestrator (Redis/BullMQ). Koneksi dari REDIS_URL.
@Module({
  imports: [
    AuthModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get<string>('REDIS_URL') ?? 'redis://redis:6379');
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            password: url.password || undefined,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: CONTENT_DROP_QUEUE }),
  ],
  controllers: [ContentDropController],
  providers: [ContentDropService, ContentDropProcessor],
})
export class OrchestratorModule {}
