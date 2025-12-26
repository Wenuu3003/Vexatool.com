-- Fix audit_log security: Add policies to prevent UPDATE and DELETE
-- Drop existing policies first to recreate them properly
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_log;

-- Create SELECT policy - users can only view their own logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create INSERT policy - users can only insert their own logs  
CREATE POLICY "Users can insert their own audit logs" 
ON public.audit_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Explicitly deny UPDATE - no policy means no access
-- Explicitly deny DELETE - no policy means no access
-- RLS is already enabled, so without UPDATE/DELETE policies, those operations are blocked