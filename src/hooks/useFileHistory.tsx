import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useFileHistory = () => {
  const { user } = useAuth();

  const saveFileHistory = async (fileName: string, fileType: string, toolUsed: string) => {
    if (!user) return;

    try {
      await supabase.from('user_files').insert({
        user_id: user.id,
        file_name: fileName,
        file_type: fileType,
        tool_used: toolUsed,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving file history:', error);
      }
    }
  };

  return { saveFileHistory };
};
