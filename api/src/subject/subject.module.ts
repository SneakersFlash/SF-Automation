import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';

// Modul Subject (SRS §7.4 SUBJ-01/02).
@Module({
  imports: [AuthModule],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
