import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards';
import { GetUser } from '../decorators';
import { Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../dto';
import { JwtService } from '@nestjs/jwt';

@Resolver()
export class AuthResolver {
  constructor(private readonly jwt: JwtService) {}

  @Query(() => String)
  @UseGuards(AccessTokenGuard)
  getCurrentUserSub(@GetUser() user: AuthUser) {
    return user.sub;
  }
}
