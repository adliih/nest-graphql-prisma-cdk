import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthConfig } from '../config';
import { AuthJwtPayload, AuthUser } from '../dto/auth.dto';

export const STRATEGY_ACCESS_TOKEN = 'access-token';
export const STRATEGY_REFRESH_TOKEN = 'refresh-token';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_ACCESS_TOKEN,
) {
  constructor(readonly config: AuthConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.accessTokenSecret,
    });
  }

  async validate(payload: AuthJwtPayload): Promise<AuthUser> {
    return {
      ...payload,
    };
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_REFRESH_TOKEN,
) {
  constructor(readonly config: AuthConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.refreshTokenSecret,
    });
  }

  async validate(payload: AuthJwtPayload): Promise<AuthUser> {
    return {
      ...payload,
    };
  }
}
