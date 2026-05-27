import { AuthError } from "@hesapport-api/auth";

import { HttpError } from "./http-error";

export function mapAuthError(err: unknown): never {
  if (err instanceof AuthError) {
    throw new HttpError(err.status, err.message, { code: err.code });
  }
  throw err;
}

export async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    mapAuthError(err);
  }
}
