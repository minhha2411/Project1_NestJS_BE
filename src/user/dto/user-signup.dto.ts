import { IsEmail, IsNotEmpty } from 'class-validator';
export class UserSignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  name?: string;
}
