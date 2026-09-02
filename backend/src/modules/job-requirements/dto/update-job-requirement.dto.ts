import { IsInt, IsNotEmpty, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJobRequirementDto {
  @ApiProperty({ example: { experience: '2 years' } })
  @IsObject()
  @IsNotEmpty()
  payload!: Record<string, any>;

  @ApiProperty({ example: 1, description: 'Optimistic lock version' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  versionNo!: number;
}
