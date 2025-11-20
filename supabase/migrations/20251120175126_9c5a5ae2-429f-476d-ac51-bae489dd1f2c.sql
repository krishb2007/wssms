-- Rollback the previous migration's INSERT policy changes
-- The INSERT policies were already correct, only SELECT needed fixing

-- Drop the duplicate policies I created
DROP POLICY IF EXISTS "Authenticated users can insert their own records" ON public.visitor_registrations;
DROP POLICY IF EXISTS "Anonymous users can register as visitors" ON public.visitor_registrations;

-- Recreate the original working INSERT policies
CREATE POLICY "Authenticated users can insert their own records" 
ON public.visitor_registrations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can register as visitors" 
ON public.visitor_registrations 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);