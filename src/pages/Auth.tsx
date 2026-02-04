import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2 } from 'lucide-react';
import { isInIframe } from '@/lib/iframeDetection';
import { 
  IframeWarning, 
  SocialLoginButtons, 
  EmailInput, 
  PasswordInput, 
  validatePassword,
  usePasswordValidation 
} from '@/components/auth';
import { CanonicalHead } from '@/components/CanonicalHead';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIframeWarning, setShowIframeWarning] = useState(false);
  const [hideOAuthButtons, setHideOAuthButtons] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isValid: isPasswordValid } = usePasswordValidation(password);

  // Check if we're in an iframe on mount
  useEffect(() => {
    if (isInIframe()) {
      setShowIframeWarning(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // For signup, enforce strong password requirements
    if (!isLogin) {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        toast({
          title: "Weak Password",
          description: passwordErrors[0],
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password" 
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in",
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueWithEmailOnly = () => {
    setShowIframeWarning(false);
    setHideOAuthButtons(true);
  };

  return (
    <>
      <CanonicalHead
        title="Login or Sign Up - MyPDFs Free PDF Tools"
        description="Create a free account or login to MyPDFs to save your file history, access AI tools, and manage your documents securely."
        keywords="login, sign up, create account, pdf tools account, mypdfs login"
      />
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">PDF Tools</span>
            </div>
            <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Login to save your file history' 
                : 'Sign up to save your processing history'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Iframe Warning - Show when detected in iframe */}
            {showIframeWarning && (
              <IframeWarning onContinueAnyway={handleContinueWithEmailOnly} />
            )}
            
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <EmailInput 
                value={email} 
                onChange={setEmail} 
              />
              
              <PasswordInput
                value={password}
                onChange={setPassword}
                showRequirements={!isLogin}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || (!isLogin && !isPasswordValid)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? 'Logging in...' : 'Signing up...'}
                  </>
                ) : (
                  isLogin ? 'Login' : 'Sign Up'
                )}
              </Button>
            </form>
            
            {/* Toggle Login/Signup */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Login"}
              </button>
            </div>
            
            {/* Social Login Section - Hidden if OAuth unavailable in iframe */}
            {!hideOAuthButtons && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <SocialLoginButtons 
                  disabled={isSubmitting}
                  onIframeDetected={() => setShowIframeWarning(true)}
                />
              </>
            )}
            
            {/* Continue without account */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:underline"
              >
                Continue without account
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;
