import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';
import ical from 'node-ical';
import { prisma } from '../utils/prisma';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } }); // temporary storage, 10MB cap

function cleanupTempFile(path: string) {
  try { fs.unlinkSync(path); } catch { /* already gone - fine */ }
}

// Runs creates in small concurrent batches instead of either one-at-a-time
// (slow - N sequential round trips) or a single all-or-nothing transaction
// (one bad row would roll back every good one) - keeps the original
// per-row tolerance (skip bad rows, count successes) while cutting total
// import time roughly by the batch size.
async function batchCreate<T>(rows: T[], createOne: (row: T) => Promise<unknown>, batchSize = 20): Promise<number> {
  let importedCount = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const outcomes = await Promise.allSettled(chunk.map(createOne));
    for (const outcome of outcomes) {
      if (outcome.status === 'fulfilled') importedCount++;
      else console.error('Error importing row:', outcome.reason);
    }
  }
  return importedCount;
}

router.post('/csv', authenticateJWT, authorizeAdmin, upload.single('csv_file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = req.file.path;

  try {
    const { categoryId, delimiter = ',', enclosure = '"', escape = '\\' } = req.body;

    if (!categoryId) {
      cleanupTempFile(filePath);
      return res.status(400).json({ error: 'Please select a category' });
    }

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser({ separator: delimiter, quote: enclosure, escape: escape }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve())
        .on('error', reject);
    });

    const importedCount = await batchCreate(results, (row) => {
      // Map CSV fields. We check multiple possible headers since CSVs might differ
      const title = row.title || row.SUMMARY || row['Event Title'] || 'Imported Event';
      const shortDescription = row.shortdesc || row.shortDescription || '';
      const description = row.description || row.DESCRIPTION || '';

      let startDate = new Date();
      if (row.begin || row.startDate || row.DTSTART) {
        startDate = new Date(row.begin || row.startDate || row.DTSTART);
      }

      let endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour default
      if (row.end || row.endDate || row.DTEND) {
        endDate = new Date(row.end || row.endDate || row.DTEND);
      }

      const price = parseFloat(row.fees || row.price || '0') || 0;
      const capacity = parseInt(row.maxpupil || row.capacity || '10', 10) || 10;
      const status = (row.published === '1' || row.status === 'PUBLISHED') ? 'PUBLISHED' : 'DRAFT';

      return prisma.event.create({
        data: { title, shortDescription, description, startDate, endDate, price, capacity, status, categoryId }
      });
    });

    cleanupTempFile(filePath);
    return res.json({ message: `Successfully imported ${importedCount} events from CSV.` });
  } catch (error) {
    console.error('CSV Import Error:', error);
    cleanupTempFile(filePath);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

router.post('/ics', authenticateJWT, authorizeAdmin, upload.single('ics_file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = req.file.path;

  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      cleanupTempFile(filePath);
      return res.status(400).json({ error: 'Please select a category' });
    }

    const events = ical.parseFile(filePath);
    const vevents = Object.values(events).filter((e): e is any => !!e && e.type === 'VEVENT');

    const importedCount = await batchCreate(vevents, (vevent) => {
      const title = vevent.summary || 'Imported ICS Event';
      const description = vevent.description || '';
      const shortDescription = vevent.location || '';
      const startDate = vevent.start ? new Date(vevent.start) : new Date();
      const endDate = vevent.end ? new Date(vevent.end) : new Date(startDate.getTime() + 60 * 60 * 1000);

      return prisma.event.create({
        data: { title, shortDescription, description, startDate, endDate, price: 0, capacity: 10, status: 'DRAFT', categoryId }
      });
    });

    cleanupTempFile(filePath);
    return res.json({ message: `Successfully imported ${importedCount} events from ICS.` });
  } catch (error) {
    console.error('ICS Import Error:', error);
    cleanupTempFile(filePath);
    res.status(500).json({ error: 'Failed to import ICS' });
  }
});

export default router;
