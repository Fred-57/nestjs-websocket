import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
