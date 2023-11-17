import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecordDto } from './dto';

@Injectable()
export class RecordService {
  constructor(private prisma: PrismaService) {}

  getRecords(userId: string) {
    return this.prisma.record.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async createRecord(userId: string, recordDto: RecordDto) {
    const record = await this.prisma.record.create({
      data: {
        level: recordDto.level,
        time: recordDto.time,
        userId: userId,
      },
    });
    return record;
  }
}
