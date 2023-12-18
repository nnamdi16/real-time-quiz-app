import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { LoginDto, RegisterUserDto } from './user.dto';

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
}
