import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  password: string;
}
