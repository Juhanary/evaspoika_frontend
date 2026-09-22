/**
 * The backend answers every error as `{ error, requestId }` (see utils/routeErrors.js
 * and the global handler in app.js). That `error` string is the one written to be read
 * by a worker in the plant — "Erän paino ei voi olla negatiivinen", not a stack trace.
 *
 * ApiError used to ignore the payload entirely and set its message to
 * "API request failed with status 400", so that string was what the tablet showed.
 * Four screens worked around it by unwrapping `payload.error` themselves; the rest —
 * BatchListScreen among them — showed `err.message` and therefore showed the status
 * line. Reading the payload here fixes every call site at once, and makes those four
 * workarounds redundant.
 *
 * Only a string `error` on an object payload is trusted: a non-JSON body (an HTML
 * error page from something in between) must not end up in an Alert.
 */
const messageFromPayload = (status: number, payload: unknown): string => {
  const error = (payload as { error?: unknown } | null | undefined)?.error;
  return typeof error === 'string' && error.trim().length > 0
    ? error.trim()
    : `API request failed with status ${status}`;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(messageFromPayload(status, payload));
    this.status = status;
    this.payload = payload;
  }
}
