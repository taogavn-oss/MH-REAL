import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSurveyDto {
  @ApiProperty({ example: 'raw-token-here' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: { score: 85, passed: true } })
  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, any>;
}
