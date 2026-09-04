import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';
import { encrypt, decrypt } from '../utils/crypto';

const router = Router();

async function getOrCreateConfig() {
  let config = await prisma.paymentConfig.findUnique({ where: { id: 'default' } });
  if (!config) {
    config = await prisma.paymentConfig.create({ data: { id: 'default' } });
  }
  return config;
}

// Admin - read. The secret is never sent back in plaintext - only whether one is set.
router.get('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({
      id: config.id,
      environment: config.environment,
      paypalClientId: config.paypalClientId,
      hasSecret: !!config.paypalClientSecret,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching payment config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { environment, paypalClientId, paypalClientSecret } = req.body;

    const data: Record<string, any> = {};
    if (environment !== undefined) data.environment = environment;
    if (paypalClientId !== undefined) data.paypalClientId = paypalClientId;
    // Blank/omitted secret means "keep the existing one" - matches the
    // password-field convention used elsewhere in the admin panel.
    if (paypalClientSecret) data.paypalClientSecret = encrypt(paypalClientSecret);

    const config = await prisma.paymentConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    res.json({
      id: config.id,
      environment: config.environment,
      paypalClientId: config.paypalClientId,
      hasSecret: !!config.paypalClientSecret,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error('Error updating payment config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Internal helper (not an HTTP route) - resolves live PayPal credentials for
// the payments routes: DB config first, env vars as a fallback for the case
// where nothing has been configured through the admin panel yet.
export async function getPaypalCredentials(): Promise<{
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'live';
}> {
  const config = await prisma.paymentConfig.findUnique({ where: { id: 'default' } });

  const clientId = config?.paypalClientId || process.env.PAYPAL_CLIENT_ID || 'mock';
  const clientSecret = config?.paypalClientSecret
    ? decrypt(config.paypalClientSecret)
    : process.env.PAYPAL_CLIENT_SECRET || 'mock';
  const environment = (config?.environment as 'sandbox' | 'live') || (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');

  return { clientId, clientSecret, environment };
}

export default router;
