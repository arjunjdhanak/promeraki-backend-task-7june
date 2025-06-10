import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Part } from './schemas/part.schema';
import { CreatePartDto } from './dto/create-part.dto';
import { AddInventoryDto } from './dto/add-invenotory.dto';
import { PartType } from 'src/common/common.enums';

@Injectable()
export class PartsService {
  constructor(@InjectModel(Part.name) private partModel: Model<Part>) {}

  private readonly creationValidation = {
    [PartType.RAW]: async (dto: CreatePartDto, id: string) => {
      return new this.partModel({
        id,
        name: dto.name,
        type: dto.type,
        quantityInStock: 0,
      });
    },

    [PartType.ASSEMBLED]: async (dto: CreatePartDto, id: string) => {
      const parts = dto.parts ?? [];

      // Validate existence of all constituent parts
      for (const constituent of parts) {
        const part = await this.partModel.findOne({ id: constituent.partId }).exec();
        if (!part) {
          throw new BadRequestException(`Part with ID ${constituent.partId} does not exist`);
        }
      }

      await this.checkCircularDependency(id, parts.map(p => p.partId));

      return new this.partModel({
        id,
        name: dto.name,
        type: dto.type,
        quantityInStock: 0,
        constituents: parts.map(p => ({ partId: p.partId, quantity: p.quantity })),
      });
    },
  };

  private readonly inventoryStrategies = {
    [PartType.RAW]: async (part: Part, quantity: number) => {
      await this.partModel.updateOne({ id: part.id }, { $inc: { quantityInStock: quantity } }).exec();
      return { status: 'SUCCESS' };
    },

    [PartType.ASSEMBLED]: async (part: Part, quantity: number) => {
      const session = await this.partModel.db.startSession();
      try {
        return await session.withTransaction(async () => {
          for (const constituent of part.constituents || []) {
            const constituentPart = await this.partModel.findOne({ id: constituent.partId }).session(session).exec();
            if (!constituentPart || constituentPart.quantityInStock < constituent.quantity * quantity) {
              return {
                status: 'FAILED',
                message: `Insufficient quantity - ${constituent.partId}`,
              };
            }
          }

          for (const constituent of part.constituents || []) {
            await this.partModel
              .updateOne(
                { id: constituent.partId },
                { $inc: { quantityInStock: -constituent.quantity * quantity } },
              )
              .session(session)
              .exec();
          }

          await this.partModel
            .updateOne({ id: part.id }, { $inc: { quantityInStock: quantity } })
            .session(session)
            .exec();

          return { status: 'SUCCESS' };
        });
      } finally {
        session.endSession();
      }
    },
  };

  async create(createPartDto: CreatePartDto): Promise<Part> {
    const { name, type } = createPartDto;
    const newId = `${name.toLowerCase()}-${Date.now()}`;

    const validated = this.creationValidation[type];
    if (!validated) {
      throw new BadRequestException(`Unsupported part type: ${type}`);
    }

    const part = await validated(createPartDto, newId);
    return part.save();
  }

  async addInventory(partId: string, addInventoryDto: AddInventoryDto): Promise<{ status: string; message?: string }> {
    const { quantity } = addInventoryDto;
    const part = await this.partModel.findOne({ id: partId }).exec();

    if (!part) {
      throw new BadRequestException(`Part with ID ${partId} not found`);
    }

    const strategy = this.inventoryStrategies[part.type];
    if (!strategy) {
      throw new BadRequestException(`Unsupported inventory operation for type: ${part.type}`);
    }

    return strategy(part, quantity);
  }

  private async checkCircularDependency(partId: string, constituentIds: string[], visited = new Set<string>()): Promise<void> {
    if (visited.has(partId)) {
      throw new BadRequestException('Circular dependency detected');
    }
    visited.add(partId);

    for (const constituentId of constituentIds) {
      const part = await this.partModel.findOne({ id: constituentId }).exec();
      if (part?.type === PartType.ASSEMBLED && part.constituents) {
        await this.checkCircularDependency(partId, part.constituents.map(c => c.partId), new Set(visited));
      }
    }
  }
}
