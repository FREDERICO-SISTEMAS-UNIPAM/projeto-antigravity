import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDeliveryRequestDto,
  CreateDeliveryRequestZodSchema,
} from './dto/create-delivery-request.dto';
import { BulkCreateDeliveryRequestsDto } from './dto/bulk-create-delivery-request.dto';
import { UpdateDeliveryRequestDto } from './dto/update-delivery-request.dto';
import { QueryDeliveryRequestsDto } from './dto/query-delivery-request.dto';
import { RawSource, DeliveryStatus } from '@prisma/client';

@Injectable()
export class DeliveryRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseAndEnrich(dto: CreateDeliveryRequestDto) {
    const parseResult = CreateDeliveryRequestZodSchema.safeParse(dto);
    if (!parseResult.success) {
      throw new BadRequestException(`Dados de solicitação inválidos: ${parseResult.error.message}`);
    }

    const requestedAt = dto.requestedAt ? new Date(dto.requestedAt) : new Date();
    const dayOfWeek = dto.dayOfWeek ?? requestedAt.getDay();
    const hourOfDay = dto.hourOfDay ?? requestedAt.getHours();

    return {
      messageHash: dto.messageHash || null,
      rawSource: dto.rawSource as RawSource,
      requesterName: dto.requesterName || null,
      requesterPhone: dto.requesterPhone || null,
      pickupLocation: dto.pickupLocation,
      pickupNeighborhood: dto.pickupNeighborhood,
      deliveryAddress: dto.deliveryAddress || null,
      deliveryNeighborhood: dto.deliveryNeighborhood,
      deliveryFee: dto.deliveryFee !== undefined ? dto.deliveryFee : null,
      requestedAt,
      dayOfWeek,
      hourOfDay,
      status: (dto.status || DeliveryStatus.PENDING) as DeliveryStatus,
    };
  }

  async create(dto: CreateDeliveryRequestDto) {
    const data = this.parseAndEnrich(dto);
    return this.prisma.deliveryRequest.create({ data });
  }

  async createBulk(bulkDto: BulkCreateDeliveryRequestsDto) {
    if (!bulkDto.items || !Array.isArray(bulkDto.items) || bulkDto.items.length === 0) {
      throw new BadRequestException('A lista de itens para inserção em lote não pode estar vazia');
    }

    const dataItems = bulkDto.items.map((item) => this.parseAndEnrich(item));

    const result = await this.prisma.deliveryRequest.createMany({
      data: dataItems,
      skipDuplicates: true,
    });

    const duplicatesIgnored = dataItems.length - result.count;

    return {
      count: result.count,
      duplicatesIgnored,
      totalReceived: dataItems.length,
      message: `${result.count} solicitações de entrega inseridas com sucesso (${duplicatesIgnored} duplicados ignorados).`,
    };
  }

  async findAll(query: QueryDeliveryRequestsDto) {
    const {
      pickupNeighborhood,
      deliveryNeighborhood,
      rawSource,
      status,
      dayOfWeek,
      hourOfDay,
      limit = 50,
      offset = 0,
    } = query;

    const where: any = {};

    if (pickupNeighborhood) {
      where.pickupNeighborhood = { contains: pickupNeighborhood, mode: 'insensitive' };
    }
    if (deliveryNeighborhood) {
      where.deliveryNeighborhood = { contains: deliveryNeighborhood, mode: 'insensitive' };
    }
    if (rawSource) {
      where.rawSource = rawSource as RawSource;
    }
    if (status) {
      where.status = status as DeliveryStatus;
    }
    if (dayOfWeek !== undefined) {
      where.dayOfWeek = Number(dayOfWeek);
    }
    if (hourOfDay !== undefined) {
      where.hourOfDay = Number(hourOfDay);
    }

    const take = Number(limit);
    const skip = Number(offset);

    const [total, items] = await Promise.all([
      this.prisma.deliveryRequest.count({ where }),
      this.prisma.deliveryRequest.findMany({
        where,
        take,
        skip,
        orderBy: { requestedAt: 'desc' },
      }),
    ]);

    return { total, limit: take, offset: skip, items };
  }

  async findOne(id: string) {
    const deliveryRequest = await this.prisma.deliveryRequest.findUnique({
      where: { id },
    });

    if (!deliveryRequest) {
      throw new NotFoundException(`Solicitação de entrega com ID "${id}" não encontrada`);
    }

    return deliveryRequest;
  }

  async update(id: string, updateDto: UpdateDeliveryRequestDto) {
    await this.findOne(id);

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.requestedAt) {
      const dateObj = new Date(updateDto.requestedAt);
      dataToUpdate.requestedAt = dateObj;
      if (updateDto.dayOfWeek === undefined) dataToUpdate.dayOfWeek = dateObj.getDay();
      if (updateDto.hourOfDay === undefined) dataToUpdate.hourOfDay = dateObj.getHours();
    }

    return this.prisma.deliveryRequest.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.deliveryRequest.delete({
      where: { id },
    });
  }
}
