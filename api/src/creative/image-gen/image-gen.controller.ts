import { randomUUID } from 'crypto';
import { extname } from 'path';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser, type AuthUser } from '../../auth/current-user.decorator';
import { ImageGenService } from './image-gen.service';
import { GenerateImageDto } from './dto/image-gen.dto';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB, di bawah client_max_body_size nginx 10m

// CRE-06 (IA §7): Owner + Member sama dgn content-brief.
@Controller('creative/images')
export class ImageGenController {
  constructor(
    private readonly imageGen: ImageGenService,
    private readonly config: ConfigService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR ?? './uploads',
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: MAX_FILE_BYTES, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
          cb(new BadRequestException('File harus JPEG, PNG, atau WebP.'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File tidak ditemukan.');
    const base = this.config.get<string>('PUBLIC_API_BASE_URL') ?? '';
    return { url: `${base}/uploads/${file.filename}` };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  generate(@Body() dto: GenerateImageDto, @CurrentUser() user: AuthUser) {
    return this.imageGen.generate(dto, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  get(@Param('id') id: string) {
    return this.imageGen.get(id);
  }

  // Webhook dari kie.ai -- TANPA JWT (pihak ketiga tak bisa kirim Bearer kita).
  // Secret dititip via query param di callBackUrl saat createTask (lihat
  // image-gen.service.ts), bukan header, karena kita tak kontrol header apa
  // yang dikirim kie.ai balik.
  @Post('callback')
  async callback(@Query('secret') secret: string, @Body() body: unknown) {
    const expected = this.config.get<string>('KIEAI_CALLBACK_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Callback secret salah.');
    }
    const payload = body as {
      code?: number;
      data?: { taskId?: string; info?: { result_urls?: string[] } };
    };
    const taskId = payload?.data?.taskId;
    if (!taskId) return { ok: true }; // payload tak dikenal, jangan error (hindari retry storm kie.ai)

    const success = payload.code === 200;
    await this.imageGen.applyResult(taskId, {
      status: success ? 'done' : 'error',
      resultUrls: payload.data?.info?.result_urls ?? [],
      errorMessage: success ? undefined : `kie.ai callback code ${payload.code}`,
    });
    return { ok: true };
  }
}
