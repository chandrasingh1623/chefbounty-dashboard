import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  email: string;
  onClose?: () => void;
}

export function EmailVerificationBanner({ email, onClose }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await apiRequest('POST', '/api/auth/resend-verification', { email });
      setIsResent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend email",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="border-blue-200 bg-blue-50 mb-6">
      <Mail className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="space-y-3">
          <div>
            <p className="font-medium mb-2">Email verification required</p>
            <p className="text-sm leading-relaxed">
              We sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to complete your registration.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              {isResent ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Email sent!
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-blue-600 border-blue-200 hover:bg-blue-100"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              )}
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-blue-600 hover:bg-blue-100 px-2"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface VerificationStatusProps {
  status: 'verified' | 'already-verified' | 'invalid' | 'expired' | null;
}

export function VerificationStatus({ status }: VerificationStatusProps) {
  if (!status) return null;

  const statusConfig = {
    verified: {
      icon: CheckCircle2,
      title: "Email verified successfully!",
      description: "Your account is now active. You can sign in below.",
      variant: "default" as const,
      className: "border-green-200 bg-green-50 text-green-800",
      iconClassName: "text-green-600"
    },
    'already-verified': {
      icon: CheckCircle2,
      title: "Email already verified",
      description: "Your account is active. You can sign in below.",
      variant: "default" as const,
      className: "border-blue-200 bg-blue-50 text-blue-800",
      iconClassName: "text-blue-600"
    },
    invalid: {
      icon: AlertCircle,
      title: "Invalid verification link",
      description: "This verification link is invalid or has expired. Please request a new one.",
      variant: "destructive" as const,
      className: "border-red-200 bg-red-50 text-red-800",
      iconClassName: "text-red-600"
    },
    expired: {
      icon: AlertCircle,
      title: "Verification link expired",
      description: "This verification link has expired. Please request a new one.",
      variant: "destructive" as const,
      className: "border-red-200 bg-red-50 text-red-800",
      iconClassName: "text-red-600"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Alert className={config.className + " mb-6"}>
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <AlertDescription>
        <p className="font-medium mb-1">{config.title}</p>
        <p className="text-sm">{config.description}</p>
      </AlertDescription>
    </Alert>
  );
}