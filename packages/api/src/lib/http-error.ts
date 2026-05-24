export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function statusToHttpError(status: number, message: string, details?: unknown): HttpError {
  return new HttpError(status, message, details);
}
