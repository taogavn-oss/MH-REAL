import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ApprovalActionEnum {
  submit = 'submit',
  approve = 'approve',
  reject = 'reject',
}

export class ApproveJobRequirementDto {
  @ApiProperty({ enum: ApprovalActionEnum })
  @IsEnum(ApprovalActionEnum)
  @IsNotEmpty()
  action!: ApprovalActionEnum;

  @ApiProperty({ example: 1, description: 'Optimistic lock version' })
  @IsInt()
  @IsNotEmpty()
  versionNo!: number;

  @ApiProperty({ example: 'Looks good', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
