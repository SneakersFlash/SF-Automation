import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// AUD-02 (IA §7): Owner only.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('generations')
  generations() {
    return this.audit.generations();
  }

  @Get('actions')
  actions() {
    return this.audit.actions();
  }
}
