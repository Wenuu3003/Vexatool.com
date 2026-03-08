import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Helper for tables not yet in auto-generated types
const db = supabase as any;

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await db.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  const setupFirstAdmin = async () => {
    if (!user) return false;
    try {
      const { data, error } = await db.rpc("setup_first_admin");
      if (error) throw error;
      if (data) {
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Setup admin failed:", err);
      return false;
    }
  };

  return { isAdmin, isLoading, setupFirstAdmin, user };
};
