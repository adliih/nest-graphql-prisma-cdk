import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_ACCESS_TOKEN, STRATEGY_REFRESH_TOKEN } from '../stragies';

@Injectable()
export class AccessTokenGuard extends AuthGuard(STRATEGY_ACCESS_TOKEN) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

@Injectable()
export class RefreshTokenGuard extends AuthGuard(STRATEGY_REFRESH_TOKEN) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
