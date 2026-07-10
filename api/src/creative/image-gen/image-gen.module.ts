import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../../auth/auth.module';
import { ImageGenController } from './image-gen.controller';
import { ImageGenService, IMAGE_GEN_QUEUE } from './image-gen.service';
import { ImageGenProcessor } from './image-gen.processor';
import { KieaiService } from './kieai.service';

// CRE-06 Generate Gambar (kie.ai). Konfigurasi BullMQ sendiri (mirip pola
// OrchestratorModule) -- forRootAsync di-scope ke module ini, bukan global.
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
    BullModule.registerQueue({ name: IMAGE_GEN_QUEUE }),
  ],
  controllers: [ImageGenController],
  providers: [KieaiService, ImageGenService, ImageGenProcessor],
})
export class ImageGenModule {}
