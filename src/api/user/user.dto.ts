import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'Please enter a valid email' })
  @ApiProperty({
    description: 'Email',
    example: 'johndoe@example.com',
    required: true,
    title: 'email',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;

  @IsString()
  @MaxLength(20)
  @ApiProperty({
    description: 'Password',
    example: 'haJhsjk@#4jaiijsk',
    required: true,
    title: 'password',
  })
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be greater than 7 characters',
  })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@<>%()&|#$+&*~_.,?;:/^^\\-]).{8,}$/,
    {
      message:
        'Password must be at least one uppercase, lowercase, number and special character',
    },
  )
  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username',
    example: 'John#123',
    required: true,
    title: 'username',
  })
  username: string;
}
