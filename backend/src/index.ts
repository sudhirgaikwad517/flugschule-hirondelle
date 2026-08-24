import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import eventsRoutes from './routes/events.routes';
import newslettersRoutes from './routes/newsletters.routes';
import bookingsRoutes from './routes/bookings.routes';
import categoryRoutes from './routes/categories.routes';
import 'dotenv/config'; // loads .env variables

const app = express();
const PORT = process.env.PORT || 5555;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flugschule Hirondelle API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin / User management routes
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/categories', categoryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Trigger restart

// Trigger restart 2
