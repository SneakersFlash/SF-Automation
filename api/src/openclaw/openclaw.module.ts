import { Global, Module } from '@nestjs/common';
import { OpenclawService } from './openclaw.service';

// Global agar creative/ads bisa inject tanpa re-import (gerbang generatif).
@Global()
@Module({
  providers: [OpenclawService],
  exports: [OpenclawService],
})
export class OpenclawModule {}
