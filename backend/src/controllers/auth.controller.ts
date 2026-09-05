import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { JWT_SECRET } from '../utils/config';
import { createOtp, verifyAndConsumeOtp } from '../utils/otp';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';

async function sendOtpEmail(email: string, code: string, purpose: 'LOGIN' | 'PASSWORD_RESET') {
  const { transporter, config } = await getNewsletterTransporter();
  const fromName = config?.fromName || 'Flugschule Hirondelle';
  const fromEmail = config?.fromEmail || 'no-reply@fs-hirondelle.de';
  const subject = purpose === 'LOGIN' ? 'Ihr Anmeldecode' : 'Ihr Code zum Zurücksetzen des Passworts';
  const intro = purpose === 'LOGIN'
    ? 'mit folgendem Code können Sie sich anmelden:'
    : 'mit folgendem Code können Sie Ihr Passwort zurücksetzen:';

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject,
    html: `
      <p>Hallo,</p>
      <p>${intro}</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>Dieser Code ist 10 Minuten gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
    `,
  });
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.blocked) {
      res.status(403).json({ message: 'Dieses Konto wurde gesperrt. Bitte kontaktieren Sie uns.' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    require('fs').appendFileSync('login_error.log', JSON.stringify({ body: req.body, error: error?.toString(), stack: error instanceof Error ? error.stack : undefined }) + '\\n');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, username, email, password, address1, location, country, postalCode, phone, weight, birthDate } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Hardcode role to CUSTOMER for public registration
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: passwordHash,
        address1,
        location,
        country,
        postalCode,
        phone,
        weight,
        birthDate,
        role: 'CUSTOMER', // default role
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const SELF_SELECT = {
  id: true, name: true, email: true, role: true, phone: true, username: true,
  address1: true, location: true, postalCode: true, country: true, birthDate: true,
  weight: true, createdAt: true,
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: String(req.user!.id) }, select: SELF_SELECT });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, phone, username, address1, location, postalCode, country, birthDate, weight } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: String(req.user!.id) },
      data: { name, phone, username, address1, location, postalCode, country, birthDate, weight },
      select: SELF_SELECT,
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const changeMyPassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: 'Aktuelles und neues Passwort sind erforderlich' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: String(req.user!.id) } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Aktuelles Passwort ist falsch' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } });
    res.json({ message: 'Passwort erfolgreich geändert' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Email OTP: passwordless login ---

export const requestLoginOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'E-Mail-Adresse ist erforderlich' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Same response whether or not the account exists, to avoid leaking
    // which emails are registered.
    if (user && !user.blocked) {
      const code = await createOtp(email, 'LOGIN');
      await sendOtpEmail(email, code, 'LOGIN');
    }
    res.json({ message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Code gesendet.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginWithOtp = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ message: 'E-Mail und Code sind erforderlich' });
    return;
  }
  try {
    const valid = await verifyAndConsumeOtp(email, code, 'LOGIN');
    if (!valid) {
      res.status(401).json({ message: 'Der Code ist ungültig oder abgelaufen.' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.blocked) {
      res.status(401).json({ message: 'Anmeldung nicht möglich.' });
      return;
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Email OTP: forgot password ---

export const requestPasswordResetOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'E-Mail-Adresse ist erforderlich' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const code = await createOtp(email, 'PASSWORD_RESET');
      await sendOtpEmail(email, code, 'PASSWORD_RESET');
    }
    res.json({ message: 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Code gesendet.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    res.status(400).json({ message: 'E-Mail, Code und neues Passwort sind erforderlich' });
    return;
  }
  try {
    const valid = await verifyAndConsumeOtp(email, code, 'PASSWORD_RESET');
    if (!valid) {
      res.status(401).json({ message: 'Der Code ist ungültig oder abgelaufen.' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } });
    res.json({ message: 'Passwort erfolgreich zurückgesetzt.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
