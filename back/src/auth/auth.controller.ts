import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { LoginUserDto } from './dto/log-user.dto';
import { RequestWithUser } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return {
      message: 'Utilisateur créé avec succès',
      user,
    };
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginUserDto: LoginUserDto) {
    const user = await this.authService.login(loginUserDto);
    return {
      message: 'Connexion réussie',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getAuthenticatedUser(@Request() request: RequestWithUser) {
    return await this.authService.findUserById(request.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() request: RequestWithUser,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    const user = await this.authService.updateProfile(
      request.user.userId,
      updateUserDto,
    );
    return {
      message: 'Profil mis à jour avec succès',
      user,
    };
  }

  @Post('logout')
  async logout(@Body('userId') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Déconnexion réussie' };
  }
}
