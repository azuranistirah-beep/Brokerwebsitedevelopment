import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface AutoAdminSetupProps {
  onComplete: () => void;
}

export function AutoAdminSetup({ onComplete }: AutoAdminSetupProps) {
  const [status, setStatus] = useState<"checking" | "creating" | "complete" | "error">("checking");
  const [message, setMessage] = useState("");
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    checkAndCreateAdmin();
  }, []);

  const checkAndCreateAdmin = async () => {
    try {
      setStatus("checking");
      setMessage("Checking if admin exists...");

      // Check if any admin exists
      const checkResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/check-admin`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`
          }
        }
      );

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        if (checkData.adminExists) {
          setAdminExists(true);
          setStatus("complete");
          setMessage("Admin account already exists. You can login now.");
          setTimeout(onComplete, 2000);
          return;
        }
      }

      // No admin exists, create default admin
      setStatus("creating");
      setMessage("Creating default admin account...");

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: "admin@investoft.com",
            password: "Admin123456",
            name: "Super Admin",
            role: "admin",
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("complete");
        setMessage("Admin account created successfully!");
        console.log("✅ Default admin created:");
        console.log("📧 Email: admin@investoft.com");
        console.log("🔑 Password: Admin123456");
        
        setTimeout(onComplete, 2000);
      } else {
        // Admin might already exist
        if (data.error && data.error.includes("already")) {
          setAdminExists(true);
          setStatus("complete");
          setMessage("Admin account already exists. You can login now.");
          setTimeout(onComplete, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to create admin account");
        }
      }
    } catch (error: any) {
      console.error("Auto admin setup error:", error);
      setStatus("error");
      setMessage(error.message || "Setup failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          {status === "checking" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Initializing Platform
              </h3>
              <p className="text-slate-600">{message}</p>
            </>
          )}

          {status === "creating" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Setting Up Admin
              </h3>
              <p className="text-slate-600">{message}</p>
              <div className="mt-4 text-sm text-slate-500">
                This will only take a moment...
              </div>
            </>
          )}

          {status === "complete" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {adminExists ? "Ready to Login" : "Setup Complete!"}
              </h3>
              <p className="text-slate-600 mb-4">{message}</p>
              
              {!adminExists && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Default Admin Credentials:
                  </p>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Email:</strong> admin@investoft.com</p>
                    <p><strong>Password:</strong> Admin123456</p>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    💡 Save these credentials! You can change them later.
                  </p>
                </div>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Setup Failed
              </h3>
              <p className="text-slate-600 mb-4">{message}</p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left text-sm">
                <p className="font-semibold text-yellow-900 mb-2">
                  Manual Setup Required:
                </p>
                <ol className="list-decimal list-inside text-yellow-800 space-y-1">
                  <li>Click the dot (.) after "Investoft" in footer</li>
                  <li>Create admin account manually</li>
                  <li>Or check Edge Functions logs</li>
                </ol>
              </div>

              <button
                onClick={onComplete}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Continue to App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
