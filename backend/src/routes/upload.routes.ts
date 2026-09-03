import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/', authenticateJWT, authorizeAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Keine Datei hochgeladen' });
    }
    // Return the public URL for the uploaded file
    // We assume express static will serve from /uploads/
    const fileUrl = `http://localhost:5556/uploads/${req.file.filename}`;
    res.status(201).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Internal server error during upload' });
  }
});

export default router;
