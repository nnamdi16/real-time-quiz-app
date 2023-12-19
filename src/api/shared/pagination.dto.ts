import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class Pagination {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Page Number',
    example: 1,
    required: true,
    title: 'page',
    default: 1,
  })
  page: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @ApiProperty({
    description: 'Size of data',
    example: 10,
    required: true,
    title: 'limit',
    default: 10,
  })
  limit: number;
}
