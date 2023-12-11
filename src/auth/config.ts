import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthConfig {
  readonly accessTokenSecret;
  readonly refreshTokenSecret;
}
