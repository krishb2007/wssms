-- Remove the overly permissive public SELECT policies that expose all visitor data
DROP POLICY IF EXISTS "Enable insert for all data" ON public.visitor_registrations;
DROP POLICY IF EXISTS "Insert for All" ON public.visitor_registrations;

-- Create a secure admin-only policy for viewing all registrations
CREATE POLICY "Admins can view all registrations" 
ON public.visitor_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Keep the existing policy for users to view their own records (for authenticated visitors)
-- "Users can view their own records" policy already exists and is appropriate

-- Keep the existing INSERT policy for public visitor registration
-- "Users can insert their own records" policy already exists and allows unauthenticated inserts (user_id IS NULL)