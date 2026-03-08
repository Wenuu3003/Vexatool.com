import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { isAdmin, isLoading, user, setupFirstAdmin } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8 space-y-4">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">
            You don't have admin privileges. If you're the first user, you can claim admin access.
          </p>
          <Button onClick={setupFirstAdmin} size="lg">
            Claim Admin Access
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
