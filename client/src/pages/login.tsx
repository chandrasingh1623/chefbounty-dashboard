import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Mail, CheckCircle, Facebook, Linkedin } from "lucide-react";
import logoImage from "@assets/ChefBounty Lg (2)_1753288571802.png";
import { EmailVerificationBanner, VerificationStatus } from "@/components/auth/email-verification-banner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["host", "chef"], { required_error: "Please select a role" }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmailSent, setForgotPasswordEmailSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Check for OAuth callback
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('token');
      const provider = params.get('provider');
      const newUser = params.get('newUser') === 'true';
      
      if (token) {
        // Store token temporarily
        localStorage.setItem('chefbounty_token', token);
        
        // Fetch user data with the token
        fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            // Store user data
            localStorage.setItem('chefbounty_user', JSON.stringify(data.user));
            
            toast({
              title: "Login successful",
              description: `Welcome back! You've signed in with ${provider}.`,
            });
            
            // Clear hash from URL
            window.location.hash = '';
            
            // Redirect based on user state
            window.location.href = window.location.pathname === '/onboarding' ? '/onboarding' : '/dashboard';
          }
        })
        .catch(err => {
          console.error('Failed to fetch user profile:', err);
          localStorage.removeItem('chefbounty_token');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to complete login. Please try again.",
          });
        });
      }
    }
  }, []);

  // Check for verification status and errors from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const verificationMessage = urlParams.get('message');
  const errorParam = urlParams.get('error');
  
  // Show OAuth error messages
  useEffect(() => {
    if (errorParam) {
      let errorMessage = 'Authentication failed';
      switch (errorParam) {
        case 'oauth_denied':
          errorMessage = 'OAuth authorization was denied';
          break;
        case 'invalid_state':
          errorMessage = 'Invalid authentication state. Please try again.';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Failed to complete authentication. Please try again.';
          break;
        case 'profile_fetch_failed':
          errorMessage = 'Failed to fetch user profile. Please try again.';
          break;
        case 'auth_failed':
          errorMessage = 'Authentication failed. Please try again.';
          break;
      }
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorMessage,
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [errorParam, toast]);
  
  const getVerificationStatus = (): 'verified' | 'already-verified' | 'invalid' | 'expired' | null => {
    switch (verificationMessage) {
      case 'verified': return 'verified';
      case 'already-verified': return 'already-verified';
      case 'invalid': return 'invalid';
      case 'expired': return 'expired';
      default: return null;
    }
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: undefined,
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      // Check if it's an email verification error
      if (error.message.includes('verify your email') || 
          (error.response && error.response.needsEmailVerification)) {
        setNeedsVerification(true);
        setVerificationEmail(data.email);
        toast({
          title: "Email verification required",
          description: "Please check your email and verify your account before signing in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signUp(data);
      setSignupEmail(data.email);
      setEmailSent(true);
      setNeedsVerification(true);
      setVerificationEmail(data.email);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before signing in.",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'facebook' | 'linkedin') => {
    // Redirect to OAuth endpoint
    window.location.href = `/api/auth/${provider}`;
  };

  const resendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      // Make API call to resend verification email
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail }),
      });

      if (response.ok) {
        toast({
          title: "Email sent!",
          description: "Verification email has been resent to your inbox.",
        });
      } else {
        throw new Error('Failed to resend email');
      }
    } catch (error) {
      toast({
        title: "Failed to resend email",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setForgotPasswordEmailSent(true);
        toast({
          title: "Reset email sent!",
          description: "Check your email for password reset instructions.",
        });
      } else {
        throw new Error('Failed to send reset email');
      }
    } catch (error) {
      toast({
        title: "Failed to send reset email",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={logoImage} 
              alt="ChefBounty" 
              className="h-20 w-auto object-contain"
              style={{ maxHeight: '80px', width: 'auto' }}
            />
          </div>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show verification status messages */}
          <VerificationStatus status={getVerificationStatus()} />
          
          {/* Show email verification banner if needed */}
          {needsVerification && verificationEmail && (
            <EmailVerificationBanner 
              email={verificationEmail}
              onClose={() => setNeedsVerification(false)}
            />
          )}

          {emailSent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a verification email to <strong>{signupEmail}</strong>.
                  Please check your inbox and click the verification link to complete your registration.
                </p>
                <Button 
                  onClick={resendVerificationEmail}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? "Sending..." : "Resend Verification Email"}
                </Button>
              </div>
            </div>
          ) : showForgotPassword ? (
            forgotPasswordEmailSent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Reset Email Sent
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We've sent password reset instructions to your email address.
                    Please check your inbox and follow the link to reset your password.
                  </p>
                  <Button 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmailSent(false);
                      forgotPasswordForm.reset();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Reset Your Password
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-primary text-white hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Email"}
                    </Button>
                  </form>
                </Form>
                <Button 
                  onClick={() => setShowForgotPassword(false)}
                  variant="ghost"
                  className="w-full text-gray-500"
                >
                  Back to Sign In
                </Button>
              </div>
            )
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="space-y-4">
                  {/* SSO Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full relative hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => handleOAuthLogin('linkedin')}
                    >
                      <Linkedin className="h-5 w-5 text-[#0077B5] absolute left-4" />
                      Continue with LinkedIn
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  {/* Email/Password Form */}
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            
            <TabsContent value="signup">
              {emailSent ? (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
                    <p className="text-gray-600 mt-2">
                      We've sent a verification link to <strong>{signupEmail}</strong>
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-blue-900">Didn't receive the email?</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Check your spam folder or click the button below to resend.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={resendVerificationEmail}
                    variant="outline"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Sending..." : "Resend verification email"}
                  </Button>
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="ghost"
                    className="w-full text-gray-500"
                  >
                    Back to signup
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* SSO Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full relative hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => handleOAuthLogin('linkedin')}
                    >
                      <Linkedin className="h-5 w-5 text-[#0077B5] absolute left-4" />
                      Continue with LinkedIn
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
                    </div>
                  </div>

                  {/* Signup Form */}
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="host" id="host" />
                              <Label htmlFor="host">Host (I need a chef)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="chef" id="chef" />
                              <Label htmlFor="chef">Chef (I provide services)</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <Button
                      type="submit"
                      className="w-full bg-primary text-white hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                    </form>
                  </Form>
                </div>
              )}
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
