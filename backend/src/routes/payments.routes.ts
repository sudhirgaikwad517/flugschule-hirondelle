import { Router } from 'express';
import { prisma } from '../utils/prisma';
import paypal from '@paypal/checkout-server-sdk';
import { sendBookingConfirmationEmail } from '../services/mailer.service';
import { getPaypalCredentials } from './paymentConfig.routes';

const router = Router();

async function getPaypalClient() {
  const { clientId, clientSecret, environment } = await getPaypalCredentials();
  const Environment = environment === 'live' ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment;
  return {
    client: new paypal.core.PayPalHttpClient(new Environment(clientId, clientSecret)),
    isMock: clientId === 'mock',
  };
}

// Create Checkout Session (PayPal)
router.post('/create-session', async (req: any, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (paymentMethod !== 'PayPal') {
      res.status(400).json({ message: 'Invalid payment method' });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: { include: { ticket: true } }, event: true }
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.totalPrice === 0) return res.status(400).json({ message: 'No payment required' });

    const { client: paypalClient, isMock } = await getPaypalClient();

    if (isMock) {
      // Return a mock success URL for local testing without keys configured yet
      return res.json({ url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/booking-success?paypal=true&token=mock_token_123&booking_id=${booking.id}`, orderId: 'mock_token_123' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: booking.id,
        amount: {
          currency_code: 'EUR',
          value: booking.totalPrice.toFixed(2)
        }
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/booking-success?paypal=true&booking_id=${booking.id}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/booking-cancel?booking_id=${booking.id}`,
      }
    });

    const response = await paypalClient.execute(request);
    const approveLink = response.result.links.find((link: any) => link.rel === 'approve');

    res.json({ url: approveLink.href, orderId: response.result.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment session creation failed' });
  }
});

// Capture PayPal Order
router.post('/capture-paypal', async (req, res) => {
  try {
    const { orderId, bookingId } = req.body;

    const { client: paypalClient, isMock } = await getPaypalClient();

    if (isMock && orderId === 'mock_token_123') {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      });
      sendBookingConfirmationEmail(booking.id).catch(console.error);
      return res.json({ success: true });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    if (capture.result.status === 'COMPLETED') {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      });
      // Send confirmation email asynchronously
      sendBookingConfirmationEmail(booking.id).catch(console.error);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'PayPal capture failed' });
  }
});

export default router;
