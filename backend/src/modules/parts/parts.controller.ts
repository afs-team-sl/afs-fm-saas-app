import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('parts')
@UseGuards(JwtAuthGuard)
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  create(@Request() req, @Body() createPartDto: CreatePartDto) {
    return this.partsService.create(req.user.tenantId, createPartDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.partsService.findAll(req.user.tenantId);
  }

  @Get('low-stock')
  findLowStock(@Request() req) {
    return this.partsService.findLowStock(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.partsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePartDto: UpdatePartDto,
  ) {
    return this.partsService.update(id, req.user.tenantId, updatePartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.partsService.remove(id, req.user.tenantId);
  }

  @Post(':id/restock')
  restock(
    @Param('id') id: string,
    @Request() req,
    @Body('quantity') quantity: number,
  ) {
    return this.partsService.addStock(id, quantity, req.user.tenantId);
  }
}
