export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const AuthErrors = {
  invalidCredentials: () => new AuthError("Invalid credentials", "INVALID_CREDENTIALS", 401),
  emailNotVerified: () =>
    new AuthError("Email not verified", "EMAIL_NOT_VERIFIED", 403),
  emailTaken: () => new AuthError("Email already in use", "EMAIL_TAKEN", 409),
  usernameTaken: () => new AuthError("Username already in use", "USERNAME_TAKEN", 409),
  notFound: (resource = "Resource") =>
    new AuthError(`${resource} not found`, "NOT_FOUND", 404),
  forbidden: () => new AuthError("Forbidden", "FORBIDDEN", 403),
  invalidToken: () => new AuthError("Invalid or expired token", "INVALID_TOKEN", 400),
  inactiveAccount: () => new AuthError("Account is inactive", "INACTIVE_ACCOUNT", 403),
} as const;
