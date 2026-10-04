// `authenticateJWT` (backend/src/middlewares/auth.middleware.ts) returns the
// same 403 "Forbidden: Invalid token" for an EXPIRED token as for a
// genuinely malformed one - and every one of these ~50 raw-fetch admin
// content editors (plain useState/fetch pages, not react-admin
// <SimpleForm>s) encodes a failed load fetch as plain `Error("HTTP " +
// status)`. Since these pages bypass react-admin's dataProvider entirely,
// react-admin's own "session expired -> redirect to login" handling never
// sees these requests either - a stale login (tokens last 1 day, see
// auth.controller.ts's `expiresIn: '1d'`) used to just show "Inhalte
// konnten nicht geladen werden. Bitte laden Sie die Seite neu, bevor Sie
// speichern." - true but useless, since reloading can't fix an expired
// token, only logging back in can.
export const isSessionExpiredError = (err: unknown): boolean =>
  err instanceof Error && /HTTP (401|403)/.test(err.message);
