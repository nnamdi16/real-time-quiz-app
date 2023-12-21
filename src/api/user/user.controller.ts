import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { LoginDto, RegisterUserDto, TokenData } from './user.dto';
import { RefreshTokenGuard } from '../auth/refreshToken.guard';
import { Request } from 'express';

@Controller('v1/users')
@ApiTags('users')
export class UserController {
  constructor(readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Endpoint to register a new user' })
  async register(@Body() body: RegisterUserDto) {
    return await this.userService.registerUser(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Endpoint to login user' })
  async login(@Body() body: LoginDto) {
    return await this.userService.login(body);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to generate access token using a refresh token',
  })
  async refreshToken(@Req() req: Request) {
    const payload = req.user as TokenData & { refreshToken: string };
    return await this.userService.refreshToken(payload);
  }
}
