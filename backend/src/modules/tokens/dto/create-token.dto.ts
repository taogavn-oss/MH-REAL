import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TokenPurpose {
  survey = 'survey',
  scheduling = 'scheduling',
}

export class CreateTokenDto {
  @ApiProperty({ example: 'candidate-uuid' })
  @IsUUID()
  @IsNotEmpty()
  candidateId!: string;

  @ApiProperty({ enum: TokenPurpose })
  @IsEnum(TokenPurpose)
  @IsNotEmpty()
  purpose!: TokenPurpose;
}
