import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RecordService } from './record.service';
import { RecordDto } from './dto';

@UseGuards(JwtGuard)
@Controller('record')
export class RecordController {
  constructor(private service: RecordService) {}

  @Get()
  getRecords(@GetUser('id') userId: string) {
    return this.service.getRecords(userId);
  }

  @Post()
  createRecord(@GetUser('id') userId: string, @Body() record: RecordDto) {
    return this.service.createRecord(userId, record);
  }
}
