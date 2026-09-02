import { IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty({ example: 'store-uuid' })
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty({ example: '2026-09-10' })
  @IsDateString()
  @IsNotEmpty()
  slotDate!: string;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: '2026-09-10T11:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
