import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">View site performance and usage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Google Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Analytics data is available through your Google Analytics dashboard. 
              The tracking code is already integrated into VexaTool.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Tool usage analytics and user engagement metrics will be displayed here 
              as data accumulates from the admin CMS.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
