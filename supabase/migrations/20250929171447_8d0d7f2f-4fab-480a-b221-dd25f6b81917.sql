-- Fix the security vulnerability by updating RLS policies for visitor_registrations
-- Remove the policy that allows public access when user_id is NULL

-- Drop the problematic policy that allows public access
DROP POLICY IF EXISTS "Users can view their own records" ON public.visitor_registrations;

-- Create a new secure policy that requires authentication for all SELECT operations
-- This policy ensures only authenticated users can view records they own or admins can view all
CREATE POLICY "Authenticated users can view their own records" 
ON public.visitor_registrations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Update the INSERT policy to ensure user_id is always set for authenticated users
DROP POLICY IF EXISTS "Users can insert their own records" ON public.visitor_registrations;

CREATE POLICY "Authenticated users can insert their own records" 
ON public.visitor_registrations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- For anonymous users (visitors filling the form), create a separate policy
-- that allows INSERT only when user_id is explicitly set to NULL
-- but prevents SELECT access to these records
CREATE POLICY "Anonymous users can register as visitors" 
ON public.visitor_registrations 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

-- Note: Anonymous users cannot SELECT any records, ensuring privacy
-- Only authenticated admins can view visitor registrations via the existing admin policy