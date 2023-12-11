import { Module } from '@nestjs/common';
import { AuthService } from './services';
import { AuthConfig } from './config';
import { ConfigService } from '@nestjs/config';
import { AccessTokenStrategy, RefreshTokenStrategy } from './stragies';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { AuthResolver } from './resolvers/auth.resolver';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: AuthConfig,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          accessTokenSecret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
          refreshTokenSecret: configService.get('JWT_REFRESH_TOKEN_SECRET'),
        } as AuthConfig;
      },
    },
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
    AuthResolver,
  ],
})
export class AuthModule {}
