import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Terminal, ArrowLeft, KeyRound, Mail, Lock, ShieldCheck, RefreshCw, Eye, EyeOff } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  OTPInput,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    api.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const resetState = () => {
    setShowOtpStep(false);
    setIsForgotPassword(false);
    setError(null);
    setOtp("");
    setPassword("");
    setShowPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(true);
    setTimeout(() => {
      setShowPassword(false);
    }, 2000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const type = isForgotPassword ? 'forgot_password' : 'register';
      await api.auth.sendOtp(email, type);
      setShowOtpStep(true);
      toast({
        title: "OTP Sent",
        description: `Check your email for the verification code.`,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin && !isForgotPassword) {
        // Simple Login
        await api.auth.login(email, password);
        navigate("/dashboard");
      } else if (isForgotPassword) {
        // Reset Password
        await api.auth.resetPassword(email, otp, password);
        toast({
          title: "Password Reset",
          description: "Your password has been updated. Please sign in.",
        });
        setIsLogin(true);
        resetState();
      } else {
        // Register with OTP
        await api.auth.register(email, password, otp);
        toast({
          title: "Account created",
          description: "Welcome to Vibrantz AI!",
        });
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      setLoading(true);
      await api.auth.googleLogin(response.credential);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Google Auth Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Google Auth Error",
      description: "An error occurred during Google sign in.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen gradient-hero grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => {
            if (showOtpStep || isForgotPassword) {
              resetState();
            } else {
              navigate("/");
            }
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono">
            {showOtpStep || isForgotPassword ? "Back to Auth" : "Back Home"}
          </span>
        </button>

        <div className="gradient-card border border-border rounded-2xl p-8 glow-primary relative overflow-hidden">
          {/* Subtle Progress Bar for Multi-step */}
          {showOtpStep && (
            <div className="absolute top-0 left-0 w-full h-1 bg-border">
              <div className="h-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)] w-full" />
            </div>
          )}

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              {isForgotPassword ? (
                <KeyRound className="w-6 h-6 text-primary" />
              ) : isLogin ? (
                <ShieldCheck className="w-6 h-6 text-primary" />
              ) : (
                <Terminal className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono text-foreground tracking-tight">
                {isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                {showOtpStep ? "Verify Identity" : isForgotPassword ? "Recover your account" : isLogin ? "Welcome back, architect" : "Start building blueprints"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
              <p className="text-xs font-mono text-destructive uppercase tracking-wider leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {!showOtpStep ? (
            <form onSubmit={isLogin && !isForgotPassword ? handleSubmit : handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3 text-primary" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nexus.com"
                  required
                  className="bg-background/40 border-border/50 font-mono text-sm h-12 focus-visible:ring-primary/30 rounded-xl"
                />
              </div>

              {(!isForgotPassword) && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-3 h-3 text-primary" /> Password
                    </Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-mono text-primary/60 hover:text-primary transition-colors"
                      >
                        FORGOT_PASS?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="bg-background/40 border-border/50 font-mono text-sm h-12 focus-visible:ring-primary/30 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      title="Show password for 2 seconds"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full font-mono h-12 rounded-xl text-md group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isForgotPassword ? "Send Code" : isLogin ? "Sign In" : "Create Account"}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4 flex flex-col items-center">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-widest self-start flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Security Code
                </Label>
                
                <OTPInput
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  containerClassName="group flex items-center gap-2"
                  render={({ slots }) => (
                    <div className="flex gap-2">
                      {slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className={`
                            relative w-10 h-12 flex items-center justify-center text-lg font-mono border-b-2 transition-all duration-300
                            ${slot.isActive ? 'border-primary text-primary bg-primary/5' : 'border-border/50 text-muted-foreground'}
                          `}
                        >
                          {slot.char || (slot.isActive ? "█" : "")}
                        </div>
                      ))}
                    </div>
                  )}
                />
                <p className="text-[10px] font-mono text-muted-foreground text-center mt-2">
                  SENT_TO: <span className="text-foreground">{email}</span>
                </p>
              </div>

              {isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-3 h-3 text-primary" /> New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password"
                      required
                      minLength={6}
                      className="bg-background/40 border-border/50 font-mono text-sm h-12 focus-visible:ring-primary/30 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Button type="submit" disabled={loading || otp.length < 6} className="w-full font-mono h-12 rounded-xl text-md">
                  {loading ? "Verifying..." : isForgotPassword ? "Reset Password" : "Create Account"}
                </Button>
                
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                >
                  RESEND_CODE
                </button>
              </div>
            </form>
          )}

          {!showOtpStep && !isForgotPassword && (
            <>
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <div className="flex justify-center mb-8">
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                  />
                </GoogleOAuthProvider>
              </div>
            </>
          )}

          {!showOtpStep && (
            <p className="text-center text-[10px] font-mono text-muted-foreground mt-6 uppercase tracking-widest">
              {isForgotPassword ? (
                <button
                  onClick={resetState}
                  className="text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                  Back to Sign In
                </button>
              ) : isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
