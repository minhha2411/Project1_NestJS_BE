import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async signIn(email: string, password?: string): Promise<any> {
    console.log(email, 'email');
    const user = await this.usersService.findOne(email);
    console.log(user, 'user');

    // User not exists
    if (!user) {
      throw new HttpException('NotFoundException', HttpStatus.NOT_FOUND);
    }

    // Check correct password
    let isMatch = false;
    if (password) {
      isMatch = await bcrypt.compare(password, user.password);
    }
    if (!isMatch) {
      throw new HttpException('UnauthorizedException', HttpStatus.UNAUTHORIZED);
    }

    // Generate accsess + refresh
    const accessPayload = { sub: user._id, username: user.email };
    const refreshPayload = { sub: user._id };

    const access_token = await this.jwtService.signAsync(accessPayload, {
      expiresIn: '15m',
    });
    const refresh_token = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: '7d',
    });

    // Save refreshToken to DB
    user.refreshToken = refresh_token;
    await user.save();
    console.log(user, 'user');
    return {
      user,
      access_token,
    };
  }

  async signUp(email: string, password: string): Promise<any> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    const newUser = new this.userModel({
      email,
      password: hash,
    });

    console.log(newUser, 'newUser');

    await newUser.save();
  }

  async refreshToken(refreshToken: string): Promise<any> {
    // Step 1: Verify the refresh token
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
    console.log(payload, 'payload');

    // Step 2: Find the user by ID from the refresh token payload
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Step 3: Generate a new access token
    const accessTokenPayload = { email: user.email, sub: user._id };
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: '15m', // New access token expires in 15 minutes
    });

    // Step 4: Return the new access token
    return { accessToken };
  }
}
