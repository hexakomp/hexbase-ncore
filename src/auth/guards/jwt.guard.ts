import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY } from '../../constants';

/**
 * Guard that validates the Bearer JWT token from the Authorization header.
 * Must be the first guard in the chain: JwtAuthGuard -> RBACGuard -> TableAccessGuard.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY) {}
