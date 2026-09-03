import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';
import ical from 'node-ical';
import { prisma } from '../utils/prisma';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // temporary storage

router.post('/csv', upload.single('csv_file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { categoryId, delimiter = ',', enclosure = '"', escape = '\\' } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ error: 'Please select a category' });
    }

    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser({ separator: delimiter, quote: enclosure, escape: escape }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let importedCount = 0;
        
        for (const row of results) {
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
          
          try {
            await prisma.event.create({
              data: {
                title,
                shortDescription,
                description,
                startDate,
                endDate,
                price,
                capacity,
                status,
                categoryId,
              }
            });
            importedCount++;
          } catch (e) {
            console.error('Error importing row:', e);
          }
        }
        
        // Clean up temp file
        fs.unlinkSync(req.file!.path);
        
        return res.json({ message: `Successfully imported ${importedCount} events from CSV.` });
      });
  } catch (error) {
    console.error('CSV Import Error:', error);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

router.post('/ics', upload.single('ics_file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { categoryId } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ error: 'Please select a category' });
    }

    const events = ical.parseFile(req.file.path);
    let importedCount = 0;

    for (const event of Object.values(events)) {
      if (event && event.type === 'VEVENT') {
        const vevent = event as any;
        const title = vevent.summary || 'Imported ICS Event';
        const description = vevent.description || '';
        const shortDescription = vevent.location || '';
        const startDate = vevent.start ? new Date(vevent.start) : new Date();
        const endDate = vevent.end ? new Date(vevent.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
        
        try {
          await prisma.event.create({
            data: {
              title,
              shortDescription,
              description,
              startDate,
              endDate,
              price: 0,
              capacity: 10,
              status: 'DRAFT', // Default to draft for imported ICS
              categoryId,
            }
          });
          importedCount++;
        } catch (e) {
            console.error('Error importing ICS event:', e);
        }
      }
    }
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    
    return res.json({ message: `Successfully imported ${importedCount} events from ICS.` });
  } catch (error) {
    console.error('ICS Import Error:', error);
    res.status(500).json({ error: 'Failed to import ICS' });
  }
});

export default router;
