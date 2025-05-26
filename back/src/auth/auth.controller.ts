import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<{ message: string; user: UserResponseDto }> {
    const user = await this.authService.register(createUserDto);
    return {
      message: 'Utilisateur créé avec succès',
      user,
    };
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
  ): Promise<{ message: string; user: UserResponseDto }> {
    const user = await this.authService.login(loginUserDto);
    return {
      message: 'Connexion réussie',
      user,
    };
  }

  @Post('logout')
  async logout(@Body('userId') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Déconnexion réussie' };
  }
}
