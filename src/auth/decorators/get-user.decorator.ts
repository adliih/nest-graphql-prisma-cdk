import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx).getContext();

    return context.req.user;
  },
);
