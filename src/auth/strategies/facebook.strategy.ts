import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'mock-app-id',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'mock-app-secret',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3001/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'photos'],
      scope: ['email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any, info?: any) => void): Promise<any> {
    done(null, profile);
  }
}
