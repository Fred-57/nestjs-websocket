import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatGateway } from './chat/chat.gateway';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ChatModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
