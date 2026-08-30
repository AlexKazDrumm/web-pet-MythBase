export class HttpError extends Error {
  readonly status: number;
  readonly expose: boolean;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.expose = status < 500;
  }
}

export const badRequest = (message: string): HttpError =>
  new HttpError(400, message);

export const notFound = (message: string): HttpError =>
  new HttpError(404, message);

export const conflict = (message: string): HttpError =>
  new HttpError(409, message);
