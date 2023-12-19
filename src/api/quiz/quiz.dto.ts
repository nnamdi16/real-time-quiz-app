import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { Quiz } from './quiz.entity';

export class OptionsDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The option',
    example: 'Option A',
    required: true,
    title: 'text',
  })
  text: string;

  @IsBoolean()
  @ApiProperty({
    description: 'The option',
    example: 'Option A',
    required: true,
    title: 'text',
  })
  isCorrect: boolean;
}

const options: OptionsDto[] = [
  {
    text: '3',
    isCorrect: true,
  },
  {
    text: '2',
    isCorrect: false,
  },
];

export class QuestionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The question',
    example: 'How many months are in a year',
    required: true,
    title: 'title',
  })
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionsDto)
  @ApiProperty({
    description: 'Options',
    example: options,
    required: true,
    title: 'options',
  })
  options: OptionsDto[];
}

const questions: QuestionDto[] = [
  {
    title: 'Find the sum of 1 and 2',
    options,
  },
];

export type Questions = QuestionDto & { quiz?: Quiz };

export class QuizDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Quiz title',
    example: 'Maths Quiz',
    required: true,
    title: 'title',
  })
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @ApiProperty({
    description: 'List of questions',
    example: questions,
    required: true,
    title: 'questions',
    type: [QuestionDto],
  })
  questions: QuestionDto[];
}
