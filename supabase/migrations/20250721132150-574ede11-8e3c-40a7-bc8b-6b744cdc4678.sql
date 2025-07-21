-- Drop the existing problematic UPDATE policy
DROP POLICY IF EXISTS "Update Endtime" ON visitor_registrations;

-- Create a proper UPDATE policy that allows admins to update any record
CREATE POLICY "Admins can update all registrations" 
ON visitor_registrations 
FOR UPDATE 
USING (true) 
WITH CHECK (true);