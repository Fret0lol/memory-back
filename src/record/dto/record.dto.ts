import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RecordDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  level: number;

  @IsNotEmpty()
  time: Date;
}
