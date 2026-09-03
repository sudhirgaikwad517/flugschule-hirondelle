import { Router } from 'express';
import { prisma } from '../utils/prisma';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import { sendBookingConfirmationEmail } from '../services/mailer.service';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

// Configure PayPal Environment
const Environment = process.env.NODE_ENV === 'production' 
  ? paypal.core.LiveEnvironment 
  : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID || 'mock', 
    process.env.PAYPAL_CLIENT_SECRET || 'mock'
  )
);

// Create Checkout Session
router.post('/create-session', async (req: any, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: { include: { ticket: true } }, event: true }
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.totalPrice === 0) return res.status(400).json({ message: 'No payment required' });

    if (paymentMethod === 'Stripe') {
      const isMock = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock';
      
      if (isMock) {
        // Mock success for local testing
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED' }
        });
        sendBookingConfirmationEmail(booking.id).catch(console.error);
        return res.json({ url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/booking-success?session_id=mock_session_123&booking_id=${booking.id}` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Buchung: ${booking.event.title}` },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/booking-cancel?booking_id=${booking.id}`,
        client_reference_id: booking.id,
      });

      res.json({ url: session.url });

    } else if (paymentMethod === 'PayPal') {
      const isMock = !process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID === 'mock';

      if (isMock) {
        // Return a mock success URL for local testing without keys
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
    } else {
      res.status(400).json({ message: 'Invalid payment method' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment session creation failed' });
  }
});

// Capture PayPal Order
router.post('/capture-paypal', async (req, res) => {
  try {
    const { orderId, bookingId } = req.body;
    
    const isMock = !process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID === 'mock';
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
