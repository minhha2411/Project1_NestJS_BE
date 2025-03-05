import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInDto } from 'src/user/dto/user-signin.dto';
import { Public } from 'src/constants/constant';
import { UserSignUpDto } from 'src/user/dto/user-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  signIn(@Body() { email, password }: UserSignInDto) {
    return this.authService.signIn(email, password);
  }

  @Public()
  @Post('signup')
  signUp(@Body() { email, password }: any) {
    return this.authService.signUp(email, password);
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refreshToken(refreshToken);
  }
}
