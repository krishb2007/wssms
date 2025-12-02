-- Update the default for created_at to use IST timezone
ALTER TABLE visitor_registrations 
ALTER COLUMN created_at SET DEFAULT timezone('Asia/Kolkata', now());

-- Update existing records to convert from UTC to IST (add 5 hours 30 minutes)
UPDATE visitor_registrations 
SET created_at = created_at + interval '5 hours 30 minutes'
WHERE created_at IS NOT NULL;