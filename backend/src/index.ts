import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import staffRoutes from './routes/staffRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import customerRoutes from './routes/customerRoutes';
import reportRoutes from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import payrollRoutes from './routes/payrollRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import uploadRoutes from './routes/uploadRoutes';
import exhibitRoutes from './routes/exhibitRoutes';
import cmsRoutes from './routes/cmsRoutes';
import packageRoutes from './routes/packageRoutes';

dotenv.config();

// Ensure the application uses Philippines time regardless of server location
process.env.TZ = 'Asia/Manila';


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/v1/exhibits', exhibitRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/packages', packageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('NailssentialsQC Backend API is running!');
});

// Only listen to the port if not in a serverless environment and not in test mode
if (process.env.NODE_ENV !== 'test' && (process.env.NODE_ENV !== 'production' || !process.env.VERCEL)) {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export default app;
