import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Part } from './schemas/part.schema';
import { CreatePartDto } from './dto/create-part.dto';
import { AddInventoryDto } from './dto/add-invenotory.dto';

@Injectable()
export class PartsService {
  constructor(@InjectModel(Part.name) private partModel: Model<Part>) {}

  async create(createPartDto: CreatePartDto): Promise<Part> {
    const { name, type, parts } = createPartDto;

    if (type === 'ASSEMBLED' && (!parts || parts.length === 0)) {
      throw new BadRequestException('Assembled parts must have constituent parts');
    }

    if (type === 'ASSEMBLED' && parts) {
      for (const constituent of parts) {
        const part = await this.partModel.findOne({ id: constituent.partId }).exec();
        if (!part) {
          throw new BadRequestException(`Part with ID ${constituent.partId} does not exist`);
        }
      }
    }

    const newPartId = `${name.toLowerCase()}-${Date.now()}`;

    if (type === 'ASSEMBLED' && parts) {
      await this.checkCircularDependency(newPartId, parts?.map(p => p.partId));
    }

    const part = new this.partModel({
      id: newPartId,
      name,
      type,
      quantityInStock: 0,
      constituents: (type === 'ASSEMBLED' && parts) ? parts.map(p => ({ partId: p.partId, quantity: p.quantity })) : undefined,
    });

    return part.save();
  }

  async addInventory(partId: string, addInventoryDto: AddInventoryDto): Promise<{ status: string; message?: string }> {
    const { quantity } = addInventoryDto;
    const part = await this.partModel.findOne({ id: partId }).exec();

    if (!part) {
      throw new BadRequestException(`Part with ID ${partId} not found`);
    }

    if (part.type === 'RAW') {
      await this.partModel.updateOne({ id: partId }, { $inc: { quantityInStock: quantity } }).exec();
      return { status: 'SUCCESS' };
    } else {
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
            .updateOne({ id: partId }, { $inc: { quantityInStock: quantity } })
            .session(session)
            .exec();

          return { status: 'SUCCESS' };
        });
      } finally {
        session.endSession();
      }
    }
  }

  private async checkCircularDependency(partId: string, constituentIds: string[], visited = new Set<string>()): Promise<void> {
    if (visited.has(partId)) {
      throw new BadRequestException('Circular dependency detected');
    }
    visited.add(partId);

    for (const constituentId of constituentIds) {
      const constituentPart = await this.partModel.findOne({ id: constituentId }).exec();
      if (constituentPart && constituentPart?.type === 'ASSEMBLED' && constituentPart?.constituents) {
        await this.checkCircularDependency(partId, constituentPart.constituents.map(c => c.partId), new Set(visited));
      }
    }
  }
}