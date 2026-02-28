
-- Drop the conflicting restrictive INSERT policies
DROP POLICY IF EXISTS "Anonymous users can register as visitors" ON visitor_registrations;
DROP POLICY IF EXISTS "Authenticated users can insert their own records" ON visitor_registrations;
DROP POLICY IF EXISTS "Authenticated users can register as visitors" ON visitor_registrations;

-- Create a single permissive INSERT policy that allows anonymous visitor registrations
CREATE POLICY "Anyone can register as visitor"
ON visitor_registrations
FOR INSERT
TO public
WITH CHECK (user_id IS NULL);
