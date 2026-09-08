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

// Allowlist of extensions safe to serve statically - blocks .html/.svg/etc.
// which would otherwise become stored-XSS content served same-origin from
// /uploads (an .svg or .html file renders and can carry a <script>).
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'
]);

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Dateityp ${ext || '(unbekannt)'} ist nicht erlaubt`));
    }
    cb(null, true);
  }
});

router.post('/', authenticateJWT, authorizeAdmin, (req, res, next) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload fehlgeschlagen' });
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Keine Datei hochgeladen' });
    }
    // Relative URL - this process serves both the API and the built frontend
    // from the same origin in production, and the dev Vite proxy forwards
    // /uploads too, so a relative path resolves correctly everywhere. The
    // previous hardcoded http://localhost:5556 broke every uploaded file's
    // link outside of local dev.
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Internal server error during upload' });
  }
});

export default router;
