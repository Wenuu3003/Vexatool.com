import { Outlet } from "react-router-dom";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminLayout = () => {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;
