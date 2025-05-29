import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveReactionDto {
  @IsString({
    message: 'Vous devez fournir un emoji.',
  })
  @IsNotEmpty({
    message: "L'emoji ne peut pas être vide.",
  })
  emoji: string;
}
