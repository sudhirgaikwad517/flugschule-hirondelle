// A fallback is kept so the app still runs out of the box for local
// development, but production deployments MUST set JWT_SECRET in .env -
// see .env.example. Centralized here so every consumer stays in sync.
export const JWT_SECRET = process.env.JWT_SECRET || 'hirondelle-super-secret-key';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn(
    '[SECURITY WARNING] JWT_SECRET is not set in the environment - using an insecure ' +
    'default. Set JWT_SECRET in your .env file before going live.'
  );
}
