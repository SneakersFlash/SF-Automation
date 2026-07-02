import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BrandProfileService } from './brand-profile.service';
import {
  CreateBrandProfileDto,
  UpdateBrandProfileDto,
} from './dto/brand-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// BRAND-01..05 (IA §7): create/edit/list/set-default = Owner+Member; delete = Owner.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('brand-profiles')
export class BrandProfileController {
  constructor(private readonly brands: BrandProfileService) {}

  @Get()
  list() {
    return this.brands.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.brands.get(id);
  }

  @Post()
  create(@Body() dto: CreateBrandProfileDto) {
    return this.brands.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBrandProfileDto) {
    return this.brands.update(id, dto);
  }

  @Post(':id/set-default')
  setDefault(@Param('id') id: string) {
    return this.brands.setDefault(id);
  }

  @Delete(':id')
  @Roles('owner') // BRAND-03: hapus hanya Owner
  remove(@Param('id') id: string) {
    return this.brands.remove(id);
  }
}
