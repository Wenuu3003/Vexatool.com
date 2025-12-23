-- Add missing DELETE policy for profiles table (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add missing UPDATE policy for user_files table
CREATE POLICY "Users can update their own files"
ON public.user_files
FOR UPDATE
USING (auth.uid() = user_id);