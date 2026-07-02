import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

// SUBJ-01/02 (IA §7): Owner + Member.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjects: SubjectService) {}

  @Get()
  list(@Query('brandProfileId') brandProfileId?: string) {
    return this.subjects.list(brandProfileId);
  }

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjects.create(dto);
  }
}
