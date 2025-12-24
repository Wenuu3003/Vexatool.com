import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type AuditActionType = 
  | 'ai_chat'
  | 'ai_search'
  | 'file_process'
  | 'profile_view'
  | 'profile_delete'
  | 'file_history_view'
  | 'file_history_delete';

interface AuditLogEntry {
  action_type: AuditActionType;
  action_details?: Json;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log audit event: no authenticated user');
      return;
    }

    const { error } = await supabase
      .from('audit_log')
      .insert([{
        user_id: user.id,
        action_type: entry.action_type,
        action_details: entry.action_details ?? null,
      }]);

    if (error) {
      console.error('Failed to log audit event:', error.message);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}
