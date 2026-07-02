import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Role } from './roles.decorator';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

// Ambil user hasil JwtAuthGuard dari request.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest<{ user: AuthUser }>().user;
  },
);
