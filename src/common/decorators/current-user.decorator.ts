import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../interfaces';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 *
 * @example
 * ```typescript
 * @Get('me')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
