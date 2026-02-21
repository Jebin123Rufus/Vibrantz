import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Terminal, ArrowLeft } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    api.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await api.auth.login(email, password);
        navigate("/dashboard");
      } else {
        await api.auth.register(email, password);
        toast({
          title: "Account created",
          description: "You can now sign in with your credentials.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono">Back</span>
        </button>

        <div className="gradient-card border border-border rounded-xl p-8 glow-primary">
          <div className="flex items-center gap-3 mb-8">
            <div>
              <h1 className="text-xl font-bold font-mono text-foreground">
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Welcome back, architect" : "Start building blueprints"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-mono text-muted-foreground">
                email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-background/50 border-border font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-mono text-muted-foreground">
                password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background/50 border-border font-mono text-sm"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full font-mono">
              {loading ? "Processing..." : isLogin ? "Sign In →" : "Create Account →"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-mono text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center">
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
              />
            </GoogleOAuthProvider>
          </div>


          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-mono"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
