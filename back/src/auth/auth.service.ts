import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, LoginUserDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import * as bcrypt from 'bcryptjs';

const SALT_OR_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, username, password } = createUserDto;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        "Un utilisateur avec cet email ou nom d'utilisateur existe déjà",
      );
    }

    const hashedPassword = await bcrypt.hash(password, SALT_OR_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const { username, password } = loginUserDto;

    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    }

    // Mettre à jour le statut en ligne
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isOnline: true,
      createdAt: user.createdAt,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline: false },
    });
  }

  async findUserById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
    };
  }
}
