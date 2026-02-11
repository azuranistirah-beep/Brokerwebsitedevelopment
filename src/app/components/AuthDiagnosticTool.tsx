import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { supabase } from "../lib/supabaseClient";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { AlertCircle, CheckCircle, XCircle, Info, Loader2 } from "lucide-react";

export function AuthDiagnosticTool() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      email: email,
      steps: [],
    };

    try {
      // Step 1: Check Supabase connection
      diagnostics.steps.push({
        name: "Supabase Connection",
        status: "testing",
        message: "Testing connection to Supabase...",
      });

      const healthCheck = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/health`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      ).catch(() => null);

      if (healthCheck?.ok) {
        diagnostics.steps[0].status = "success";
        diagnostics.steps[0].message = "✅ Backend connection successful";
      } else {
        diagnostics.steps[0].status = "error";
        diagnostics.steps[0].message = "❌ Cannot connect to backend. Edge Functions may not be deployed.";
        diagnostics.steps[0].solution = "Deploy Edge Functions: supabase functions deploy make-server-20da1dab";
      }

      // Step 2: Check if user exists in Auth
      diagnostics.steps.push({
        name: "User Existence Check",
        status: "testing",
        message: "Checking if user exists...",
      });

      const checkUserResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/check-user?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      ).catch(() => null);

      if (checkUserResponse?.ok) {
        const userData = await checkUserResponse.json();
        
        if (userData.exists) {
          diagnostics.steps[1].status = "success";
          diagnostics.steps[1].message = `✅ User found in Auth system`;
          diagnostics.steps[1].data = {
            userId: userData.authUser?.id,
            email: userData.authUser?.email,
            confirmed: userData.authUser?.confirmed_at ? "Yes" : "No",
            createdAt: userData.authUser?.created_at,
          };

          // Check profile
          if (userData.profile) {
            diagnostics.steps[1].profile = {
              name: userData.profile.name,
              role: userData.profile.role,
              status: userData.profile.status,
              balance: userData.profile.balance,
            };
          } else {
            diagnostics.steps[1].warning = "⚠️ User exists in Auth but no profile in database";
          }
        } else {
          diagnostics.steps[1].status = "error";
          diagnostics.steps[1].message = `❌ User NOT found in Auth system`;
          diagnostics.steps[1].solution = "User needs to Sign Up first. Go to Login → Sign Up tab.";
        }
      } else {
        diagnostics.steps[1].status = "error";
        diagnostics.steps[1].message = "❌ Cannot check user existence (backend error)";
      }

      // Step 3: Test login credentials (if password provided)
      if (password) {
        diagnostics.steps.push({
          name: "Login Test",
          status: "testing",
          message: "Testing login credentials...",
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          diagnostics.steps[2].status = "error";
          diagnostics.steps[2].message = `❌ Login failed: ${error.message}`;
          
          if (error.message.includes("Invalid login credentials")) {
            diagnostics.steps[2].possibleCauses = [
              "Email or password is incorrect",
              "User account doesn't exist (need to signup)",
              "Password was changed",
            ];
            diagnostics.steps[2].solution = "1. Check email/password spelling\n2. Try Sign Up if new user\n3. Contact admin for password reset";
          } else if (error.message.includes("Email not confirmed")) {
            diagnostics.steps[2].possibleCauses = ["Email address not verified"];
            diagnostics.steps[2].solution = "Contact admin to manually confirm email";
          }
        } else if (data.session) {
          diagnostics.steps[2].status = "success";
          diagnostics.steps[2].message = "✅ Login successful!";
          diagnostics.steps[2].data = {
            userId: data.user.id,
            accessToken: data.session.access_token.substring(0, 20) + "...",
          };

          // Step 4: Check user profile and status
          diagnostics.steps.push({
            name: "Profile & Status Check",
            status: "testing",
            message: "Checking user profile and account status...",
          });

          const profileResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
            {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            diagnostics.steps[3].status = "success";
            diagnostics.steps[3].message = "✅ Profile loaded successfully";
            diagnostics.steps[3].data = {
              name: profileData.user.name,
              email: profileData.user.email,
              role: profileData.user.role,
              status: profileData.user.status,
              balance: profileData.user.balance,
            };

            // Check status
            if (profileData.user.status === 'pending') {
              diagnostics.steps[3].warning = "⚠️ Account status: PENDING - Awaiting admin approval";
              diagnostics.steps[3].solution = "Contact admin to approve your account";
            } else if (profileData.user.status === 'rejected') {
              diagnostics.steps[3].warning = "⚠️ Account status: REJECTED";
              diagnostics.steps[3].solution = "Contact admin/support for more information";
            } else if (profileData.user.status === 'active') {
              diagnostics.steps[3].successMessage = "🎉 Account is ACTIVE - Login should work!";
            }
          } else {
            diagnostics.steps[3].status = "error";
            diagnostics.steps[3].message = "❌ Failed to load user profile";
          }

          // Sign out after diagnostic
          await supabase.auth.signOut();
        }
      }

      // Final recommendation
      diagnostics.recommendation = generateRecommendation(diagnostics);
      
    } catch (error) {
      diagnostics.error = `Unexpected error: ${error}`;
    }

    setResults(diagnostics);
    setLoading(false);
  };

  const generateRecommendation = (diag: any) => {
    const userExists = diag.steps[1]?.status === "success";
    const loginSuccess = diag.steps[2]?.status === "success";
    const profileOk = diag.steps[3]?.status === "success";

    if (!userExists) {
      return {
        title: "🔴 User Account Not Found",
        message: "This email address is not registered in the system.",
        action: "Please Sign Up first by going to: Login → Sign Up tab",
        priority: "high",
      };
    }

    if (password && !loginSuccess) {
      return {
        title: "🔴 Login Credentials Invalid",
        message: "Email exists but password is incorrect.",
        action: "1. Double-check your password (check CAPS LOCK)\n2. Contact admin for password reset if forgotten",
        priority: "high",
      };
    }

    if (loginSuccess && diag.steps[3]?.data?.status === 'pending') {
      return {
        title: "🟡 Account Pending Approval",
        message: "Your account exists and credentials are correct, but account is pending admin approval.",
        action: "Wait for admin to approve your account, or contact support to expedite.",
        priority: "medium",
      };
    }

    if (loginSuccess && diag.steps[3]?.data?.status === 'active') {
      return {
        title: "🟢 Everything Looks Good!",
        message: "Your account is active and login should work.",
        action: "Try logging in normally. If still fails, clear browser cache and try again.",
        priority: "low",
      };
    }

    return {
      title: "🔍 Further Investigation Needed",
      message: "Review the diagnostic results above.",
      action: "Contact support with this diagnostic report.",
      priority: "medium",
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "testing":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      success: "default",
      error: "destructive",
      testing: "secondary",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            Auth Diagnostic Tool
          </CardTitle>
          <CardDescription>
            This tool will help diagnose login issues and identify the root cause.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="diag-email">Email Address</Label>
            <Input
              id="diag-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="diag-password">
              Password (optional - only if testing login)
            </Label>
            <Input
              id="diag-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to only check if user exists
            </p>
          </div>
          <Button onClick={runDiagnostics} disabled={!email || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              "Run Diagnostics"
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          {/* Recommendation */}
          {results.recommendation && (
            <Card className={`border-2 ${
              results.recommendation.priority === 'high' ? 'border-red-500 bg-red-50' :
              results.recommendation.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-green-500 bg-green-50'
            }`}>
              <CardHeader>
                <CardTitle className="text-lg">{results.recommendation.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{results.recommendation.message}</p>
                <div className="bg-white p-3 rounded border mt-2">
                  <p className="font-semibold text-sm mb-1">📋 Action Required:</p>
                  <p className="text-sm whitespace-pre-line">{results.recommendation.action}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnostic Steps */}
          {results.steps.map((step: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(step.status)}
                    <CardTitle className="text-base">
                      Step {index + 1}: {step.name}
                    </CardTitle>
                  </div>
                  {getStatusBadge(step.status)}
                </div>
                <CardDescription>{step.message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {step.data && (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-semibold mb-2">Data:</p>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </div>
                )}
                {step.profile && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <p className="font-semibold mb-2">Profile:</p>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(step.profile, null, 2)}
                    </pre>
                  </div>
                )}
                {step.warning && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                    {step.warning}
                  </div>
                )}
                {step.successMessage && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
                    {step.successMessage}
                  </div>
                )}
                {step.possibleCauses && (
                  <div className="bg-red-50 p-3 rounded text-sm">
                    <p className="font-semibold mb-1">Possible Causes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {step.possibleCauses.map((cause: string, i: number) => (
                        <li key={i}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.solution && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                    <p className="font-semibold mb-1">💡 Solution:</p>
                    <p className="whitespace-pre-line">{step.solution}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Raw Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Raw Diagnostic Data (for support)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(results, null, 2));
                  alert("Diagnostic data copied to clipboard!");
                }}
              >
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
