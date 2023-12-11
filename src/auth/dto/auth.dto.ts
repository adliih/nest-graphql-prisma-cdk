export class AuthJwtPayload {
  sub: string;
  exp: number;
}

export type AuthUser = AuthJwtPayload;
