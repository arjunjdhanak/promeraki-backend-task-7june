import { Controller, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { AddInventoryDto } from './dto/add-invenotory.dto';

@Controller('api/part')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  async create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  @Post(':partId')
  async addInventory(@Param('partId') partId: string, @Body() addInventoryDto: AddInventoryDto) {
    return this.partsService.addInventory(partId, addInventoryDto);
  }
}