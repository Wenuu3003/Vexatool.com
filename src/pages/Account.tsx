import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/lib/auditLog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, FileText, Activity, Trash2, LogOut, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserFile {
  id: string;
  file_name: string;
  file_type: string;
  tool_used: string;
  processed_at: string;
}

interface AuditLogEntry {
  id: string;
  action_type: string;
  action_details: unknown;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [files, setFiles] = useState<UserFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadAccountData();
    }
  }, [user]);

  const loadAccountData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Log that user viewed their account
      await logAuditEvent({ action_type: 'profile_view' });

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch user files
      const { data: filesData } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', user.id)
        .order('processed_at', { ascending: false })
        .limit(50);

      setFiles(filesData || []);

      // Log file history view
      if (filesData && filesData.length > 0) {
        await logAuditEvent({ 
          action_type: 'file_history_view',
          action_details: { file_count: filesData.length }
        });
      }

      // Fetch recent audit logs
      const { data: auditData } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setAuditLogs(auditData || []);
    } catch (error) {
      console.error('Error loading account data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load account data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setDeletingFile(fileId);
    try {
      const { error } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      await logAuditEvent({
        action_type: 'file_history_delete',
        action_details: { file_id: fileId }
      });

      setFiles(files.filter(f => f.id !== fileId));
      toast({
        title: 'File deleted',
        description: 'File record has been removed from your history',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file record',
        variant: 'destructive',
      });
    } finally {
      setDeletingFile(null);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    
    setDeletingProfile(true);
    try {
      // Log the delete action before deleting
      await logAuditEvent({ action_type: 'profile_delete' });

      // Use edge function to delete all user data (GDPR compliance)
      // This uses service role to properly delete audit logs which have no client DELETE policy
      const { error } = await supabase.functions.invoke('delete-user-data');

      if (error) {
        throw new Error(error.message || 'Failed to delete user data');
      }

      toast({
        title: 'Profile deleted',
        description: 'Your profile, file history, and activity logs have been removed',
      });

      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'ai_chat':
      case 'ai_search':
        return 'bg-purple-100 text-purple-800';
      case 'file_process':
        return 'bg-blue-100 text-blue-800';
      case 'profile_view':
      case 'profile_delete':
        return 'bg-orange-100 text-orange-800';
      case 'file_history_view':
      case 'file_history_delete':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Account</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium text-xs font-mono truncate">{user.id}</p>
                </div>
                {profile && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Member since</p>
                      <p className="font-medium">{formatDate(profile.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last updated</p>
                      <p className="font-medium">{formatDate(profile.updated_at)}</p>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Profile & Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your profile
                      and all associated file history from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteProfile}
                      disabled={deletingProfile}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deletingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* File History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File History
              </CardTitle>
              <CardDescription>Files you've processed (last 50)</CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No files processed yet
                </p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {file.tool_used}
                          </Badge>
                          <span>{file.file_type}</span>
                          <span>•</span>
                          <span>{formatDate(file.processed_at)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={deletingFile === file.id}
                      >
                        {deletingFile === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription>Recent activity on your account (last 20)</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity recorded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getActionBadgeColor(log.action_type)}>
                          {log.action_type.replace(/_/g, ' ')}
                        </Badge>
                        {log.action_details && (
                          <span className="text-xs text-muted-foreground">
                            {JSON.stringify(log.action_details)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
