import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, Rocket } from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export function DeploymentAlert() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "ok" | "error">("checking");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        setBackendStatus("ok");
        setShowAlert(false);
      } else {
        setBackendStatus("error");
        setShowAlert(true);
      }
    } catch (error) {
      setBackendStatus("error");
      setShowAlert(true);
    }
  };

  if (!showAlert || backendStatus === "ok") {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <strong>Backend belum di-deploy!</strong> Platform tidak akan berfungsi dengan benar.
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="/manual-deployment-helper"
            className="flex items-center gap-2 bg-white text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <Rocket className="h-4 w-4" />
            Deploy Now
          </a>
          <button
            onClick={() => setShowAlert(false)}
            className="text-white/80 hover:text-white px-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
