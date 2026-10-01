UPDATE Event SET imageUrl = '/images/1-reisen/itemimg-reisen.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Reisen');
UPDATE Event SET imageUrl = '/images/1-b-schein/itemimg-b-schein.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Unbeschr. LF-Schein (B-Schein)');
UPDATE Event SET imageUrl = '/images/1-schnuppern/itemimg-schnuppern.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Schnupperkurs');
UPDATE Event SET imageUrl = '/images/1-grundkurs/itemimg-grundkurs.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Grundkurs');
UPDATE Event SET imageUrl = '/images/1-a-schein/itemimg-a-schein.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Höhenflugschulung (A-Schein)');
UPDATE Event SET imageUrl = '/images/1-winde/itemimg-winde.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Windenschulung');
UPDATE Event SET imageUrl = '/images/1-refresher/itemimg-refresher.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Refresherkurs');
UPDATE Event SET imageUrl = '/images/1-rettungsgeraete/itemimg-rettungsgeraete.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Rettungsgerätetraining');
UPDATE Event SET imageUrl = '/images/1-sicherheit/itemimg-sicherheit.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Performance Training');
UPDATE Event SET imageUrl = '/images/1-medien/itemimg-medien.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Sonstiges');
UPDATE Event SET imageUrl = '/images/1-thermik/itemimg-thermik.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Thermik- und Streckenseminar');
UPDATE Event SET imageUrl = '/images/1-groundhandling/itemimg-groundhandling.jpg' WHERE imageUrl IS NULL AND categoryId IN (SELECT id FROM Category WHERE title = 'Groundhandlingkurs');

-- Duplicate removals (events that had no bookings)
DELETE FROM EventTicket WHERE eventId IN (SELECT id FROM Event WHERE title = 'Schnupperkurs' AND startDate = '2020-03-21 08:00:00.000');
DELETE FROM EventFile WHERE eventId IN (SELECT id FROM Event WHERE title = 'Schnupperkurs' AND startDate = '2020-03-21 08:00:00.000');
DELETE FROM Event WHERE title = 'Schnupperkurs' AND startDate = '2020-03-21 08:00:00.000' LIMIT 1;

DELETE FROM EventTicket WHERE eventId IN (SELECT id FROM Event WHERE title = 'A-Theorie' AND startDate = '2018-05-20 09:30:00.000');
DELETE FROM EventFile WHERE eventId IN (SELECT id FROM Event WHERE title = 'A-Theorie' AND startDate = '2018-05-20 09:30:00.000');
DELETE FROM Event WHERE title = 'A-Theorie' AND startDate = '2018-05-20 09:30:00.000' LIMIT 1;
