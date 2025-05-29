import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/log-user.dto';
import { UserPayload } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';

const SALT_OR_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, username, password, messageColor } = createUserDto;

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

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        messageColor: messageColor || '#3B82F6', // Couleur par défaut
      },
    });

    return this.authenticateUser({
      userId: createdUser.id,
    });
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Trouver l'utilisateur
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new UnauthorizedException(
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    }

    // Mettre à jour le statut en ligne
    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: { isOnline: true },
    });

    return this.authenticateUser({
      userId: existingUser.id,
    });
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
      messageColor: user.messageColor,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    updateData: Partial<CreateUserDto>,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.messageColor && {
          messageColor: updateData.messageColor,
        }),
        ...(updateData.username && { username: updateData.username }),
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      messageColor: updatedUser.messageColor,
      isOnline: updatedUser.isOnline,
      createdAt: updatedUser.createdAt,
    };
  }

  private authenticateUser({ userId }: UserPayload) {
    const payload: UserPayload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
