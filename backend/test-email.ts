import { prisma } from './src/utils/prisma';
import { sendBookingConfirmationEmail } from './src/services/mailer.service';

async function main() {
  const latestBooking = await prisma.booking.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (latestBooking) {
    console.log('Sending email for booking:', latestBooking.id);
    await sendBookingConfirmationEmail(latestBooking.id);
  } else {
    console.log('No bookings found.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
