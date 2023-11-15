import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
