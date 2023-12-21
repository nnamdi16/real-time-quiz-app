import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { UUID } from 'crypto';

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

export class LoginDto extends PickType(RegisterUserDto, ['username']) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'password',
    example: 'haJhsjk@#4jaiijsk',
    required: true,
    title: 'newPassword',
  })
  password: string;
}

export type TokenData = {
  id: UUID;
  email: string;
  username: string;
};

export type TokenDto = {
  accessToken: string;
  refreshToken: string;
};
