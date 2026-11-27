import { Controller, Get, Post, Patch, Delete, Param, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (err: any) {
      console.error('[AuthController.login error]:', err);
      throw err;
    }
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  listUsers() {
    return this.authService.listUsers();
  }

  @Post('users')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  createUser(@Body() body: { username: string; password: string; fullName?: string; role?: string }) {
    return this.authService.createUser(body);
  }

  @Patch('users/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateUser(
    @Param('id') id: string,
    @Body() body: { fullName?: string; role?: string; password?: string },
  ) {
    return this.authService.updateUser(id, body);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Get('access-status')
  @UseGuards(AuthGuard('jwt'))
  getAccessStatus(@Req() req: any) {
    return this.authService.getAccessStatus(req.user);
  }

  @Post('request-access')
  @UseGuards(AuthGuard('jwt'))
  requestAccess(@Req() req: any, @Body('reason') reason?: string) {
    return this.authService.requestAccess(req.user, reason);
  }

  @Get('access-requests')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAccessRequests() {
    return this.authService.getAccessRequests();
  }

  @Post('access-requests/:id/unlock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  unlockManager(@Param('id') id: string) {
    return this.authService.unlockManager(id);
  }

  @Post('users/:id/lock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  lockManager(@Param('id') id: string) {
    return this.authService.lockManager(id);
  }
}

