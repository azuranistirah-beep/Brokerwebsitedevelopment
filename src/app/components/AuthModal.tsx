import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { supabase } from "../lib/supabaseClient";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (accessToken: string, userId: string) => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({ open, onClose, onSuccess, defaultTab = "login" }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email address before logging in.');
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
        console.error("Login error:", error);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Check user status before allowing access
        const profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
          {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          toast.error('Failed to fetch user profile. Please try again.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        const profileResult = await profileResponse.json();
        
        // Check if member is pending approval
        if (profileResult.user?.status === 'pending') {
          toast.error('Your account is awaiting admin approval. You will be notified once approved.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Check if member is rejected
        if (profileResult.user?.status === 'rejected') {
          toast.error('Your account has been rejected by admin. Please contact support.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        toast.success("Login successful!");
        onSuccess(data.session.access_token, data.user.id);
        onClose();
      }
    } catch (error) {
      toast.error(`Login error: ${error}`);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend to create user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            name: signupName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Signup failed: ${result.error}`);
        console.error("Signup error:", result.error);
        setLoading(false);
        return;
      }

      // Check if member needs approval
      if (result.user?.status === 'pending') {
        toast.success("Account created! Your account is awaiting admin approval. You will be notified once approved.");
        setSignupEmail("");
        setSignupPassword("");
        setSignupName("");
        setLoading(false);
        onClose();
        return;
      }

      // If admin or auto-approved, proceed with auto-login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });

      if (error) {
        toast.error(`Auto-login failed: ${error.message}. Please login manually.`);
        console.error("Auto-login error:", error);
        setLoading(false);
        return;
      }

      if (data.session) {
        toast.success("Account created successfully!");
        onSuccess(data.session.access_token, data.user.id);
        onClose();
      }
    } catch (error) {
      toast.error(`Signup error: ${error}`);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Investoft</DialogTitle>
          <DialogDescription>
             Login or create an account to start trading.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}