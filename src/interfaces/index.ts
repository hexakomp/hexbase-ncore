export interface HexbaseNCoreOptions {
  /**
   * PostgreSQL connection URL (e.g. postgres://user:pass@host:5432/db)
   */
  databaseUrl: string;

  /**
   * Secret used to sign and verify JWT tokens
   */
  jwtSecret: string;
}

export interface JwtPayload {
  /** User ID */
  sub: number;
  /** User email */
  email: string;
  /** Assigned role ID */
  roleId: number;
  /** Issued-at timestamp (added by JwtService) */
  iat?: number;
  /** Expiry timestamp (added by JwtService) */
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
