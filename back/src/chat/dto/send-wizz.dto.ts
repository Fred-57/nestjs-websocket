import { IsString, IsNotEmpty } from 'class-validator';

export class SendWizzDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;
}
