import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the authenticated userId from the request object.
 * Must be used on routes protected by JwtAuthGuard.
 *
 * @example
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.userId;
  },
);
