-- Add a read-only policy for admin_users to allow login verification
-- Only allows reading (for password verification), no insert/update/delete from client

CREATE POLICY "Allow read for login verification" 
ON public.admin_users 
FOR SELECT 
USING (true);