import { IsEnum, IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RequirementChannel {
  web = 'web',
  other_media = 'other_media',
}

export class CreateJobRequirementDto {
  @ApiProperty({ example: 'store-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty({ enum: RequirementChannel })
  @IsEnum(RequirementChannel)
  @IsNotEmpty()
  channel!: RequirementChannel;

  @ApiProperty({ example: { experience: '1 year', wage: 1000 } })
  @IsObject()
  @IsNotEmpty()
  payload!: Record<string, any>;
}
