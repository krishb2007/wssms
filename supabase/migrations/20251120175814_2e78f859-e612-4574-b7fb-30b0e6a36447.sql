-- Allow authenticated users to also register as visitors (useful for testing and edge cases)
-- This policy allows authenticated users to insert records with user_id set to NULL
CREATE POLICY "Authenticated users can register as visitors" 
ON public.visitor_registrations 
FOR INSERT 
TO authenticated
WITH CHECK (user_id IS NULL);