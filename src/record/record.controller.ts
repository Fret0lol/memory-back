import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { RecordService } from './record.service';

@UseGuards(JwtGuard)
@Controller('record')
export class RecordController {
  constructor(private service: RecordService) {}

  @Get()
  getRecords(@GetUser('id') userid: string) {
    this.service.getRecords(userid);
  }
}
