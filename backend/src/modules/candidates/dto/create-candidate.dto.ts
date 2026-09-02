import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum IntakeSource {
  manual = 'manual',
  rikuop = 'rikuop',
  referral = 'referral',
}

export class CreateCandidateDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+819012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: IntakeSource, example: IntakeSource.manual })
  @IsEnum(IntakeSource)
  @IsNotEmpty()
  source!: IntakeSource;
}
