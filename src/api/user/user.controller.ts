import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterUserDto } from './user.dto';

@Controller('v1/users')
@ApiTags('users')
export class UserController {
  constructor(readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Endpoint to register a new user' })
//   @ApiCreatedResponse({ type: AuthResponse })
//   @ApiBadRequestResponse({ type: BadRequestResponse })
  async register(@Body() body: RegisterUserDto) {
    return await this.userService.registerUser(body);
  }
}
