-- Create audit_log table for tracking sensitive actions
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries by user and time
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action_type ON public.audit_log(action_type);

-- Enable Row Level Security
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_log
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own audit logs
CREATE POLICY "Users can insert their own audit logs"
ON public.audit_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete audit logs (immutable for security)
-- No UPDATE or DELETE policies = logs cannot be tampered with

-- Add comment for documentation
COMMENT ON TABLE public.audit_log IS 'Immutable audit log for tracking sensitive user actions like AI calls and file processing';