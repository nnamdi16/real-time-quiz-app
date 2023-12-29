import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { Quiz } from '../entity/quiz.entity';
import { UUID } from 'crypto';

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
export class UserResponseDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'option(s) must have a value' })
  @ArrayUnique({ message: 'option(s) cannot contain duplicate values' })
  @IsString({ each: true, message: 'option(s) must be a string' })
  @ApiProperty({
    description: 'User Options in response to the question',
    example: ['53e67897-ba7c-4846-93e1-7f910446d35a'],
    required: true,
    title: 'options',
  })
  options: UUID[];
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

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Quiz title',
    example: 'Maths Quiz',
    required: true,
    title: 'title',
  })
  streak: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Quiz title',
    example: 'Maths Quiz',
    required: true,
    title: 'title',
  })
  streakScore: number;

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

export class QuizParams {
  @IsNotEmpty()
  @IsUUID()
  @IsString()
  @ApiProperty({
    description: 'Quiz id',
    example: '217d86fb-2c0f-46c7-975b-21635e1d7f62',
    required: true,
    title: 'id',
  })
  id: UUID;
}
export class QuestionParams {
  @IsNotEmpty()
  @IsUUID()
  @IsString()
  @ApiProperty({
    description: 'Question Id',
    example: 'f448b672-f8e5-42b1-b4d4-1062b9065a68',
    required: true,
    title: 'id',
  })
  id: UUID;
}
export class NewQuizEventDto {
  readonly quizId: string;
  readonly quizName: string;
}

export interface UserResponse {
  question: UUID;
  options: UUID[];
}

export enum TestStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}
