-- Fix: move date-windowed "Fruehbucherrabatt"-style discount override entries
-- out of EventTicket (where the migration wrongly created them as separate,
-- independently bookable tickets) and into Event.eventTieredFees (a proper
-- checkout-time discount, matching old Matukio behavior for override entries
-- that carry a real published_up/published_down validity window).
-- Verified locally: none of the affected tickets had any BookingItem rows,
-- so this is a pure metadata correction, nothing to reassign.
-- Generated 2026-09-19T19:37:36.899Z from the verified post-fix local DB state.

UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"Frühbucherrabatt","value":40,"isPercentage":false,"isDiscount":true,"validFrom":"2025-06-10T00:00:00.000Z","validUntil":"2025-06-16T13:36:18.000Z"}]' WHERE id = '021bdec7-27ef-4427-9e6d-cd9c9bed6ff4';
UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"Frühbucherrabatt bis 30.6.2023","value":50,"isPercentage":false,"isDiscount":true,"validFrom":"2023-05-31T00:00:00.000Z","validUntil":"2023-06-01T21:08:34.000Z"}]' WHERE id = '2ab22027-030a-47ea-a40f-f3855aa2d2c6';
UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"Frühbucherrabatt","value":50,"isPercentage":false,"isDiscount":true,"validFrom":"2026-05-28T15:23:40.000Z","validUntil":"2026-06-30T00:00:00.000Z"}]' WHERE id = '31839c53-8b6c-4777-b401-cf80093bbce0';
UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"Frühbucherrabatt bis 30.6.2023","value":50,"isPercentage":false,"isDiscount":true,"validFrom":"2023-05-31T00:00:00.000Z","validUntil":"2023-06-01T21:08:34.000Z"}]' WHERE id = '6cfc095c-122b-4264-a2fb-d2234a9a4b89';
UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"Frühbucher-Preis (bis 30.6.18)","value":60,"isPercentage":false,"isDiscount":true,"validFrom":null,"validUntil":"2018-06-30T00:00:00.000Z"}]' WHERE id = '7c370865-bc75-4b22-b96e-556371018727';
UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"Frühbucherrabatt bis 30.6.2024","value":50,"isPercentage":false,"isDiscount":true,"validFrom":"2024-05-07T00:00:00.000Z","validUntil":"2024-06-30T00:00:00.000Z"}]' WHERE id = '9cce43ac-3035-49e7-ae32-f6a75982ae65';
UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"inkl. Frühbucherrabatt (bis 31.12.2018)","value":40,"isPercentage":false,"isDiscount":true,"validFrom":"2018-10-01T11:28:39.000Z","validUntil":"2018-12-31T11:28:41.000Z"}]' WHERE id = '9d7678c4-c93d-45b7-952c-8a5cb40cecf1';
UPDATE Event SET tieredFees = 1, eventTieredFees = '[{"title":"Frühbucherrabatt bis 30.6.2025","value":40,"isPercentage":false,"isDiscount":true,"validFrom":"2025-06-10T00:00:00.000Z","validUntil":"2025-06-16T13:36:43.000Z"}]' WHERE id = 'ef44670e-9bd4-4763-adbf-4b9ab81ed1af';

DELETE FROM EventTicket WHERE id = '56df008d-4648-4ae7-bb94-50bec84b1d30';
DELETE FROM EventTicket WHERE id = 'bfd96695-3513-47ae-ba7a-8b7eec7916ae';
DELETE FROM EventTicket WHERE id = 'f7a01f84-27b8-4f18-8ece-f83602d8fe15';
DELETE FROM EventTicket WHERE id = '797b6683-a3dd-4241-95f3-10bf8d8be399';
DELETE FROM EventTicket WHERE id = '79674c26-c4dd-4967-9362-e5f3297f34e8';
DELETE FROM EventTicket WHERE id = '4f2f1940-f9e3-418c-b38d-a80703746453';
DELETE FROM EventTicket WHERE id = '19cdaf3b-cdb4-4fca-9be0-66a1ac243134';
DELETE FROM EventTicket WHERE id = '62f006e5-4355-44b3-a83d-1fe3fa1f9187';
