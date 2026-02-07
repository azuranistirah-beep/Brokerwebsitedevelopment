import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Shield } from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";

interface AdminSetupProps {
  onComplete: () => void;
}

export function AdminSetup({ onComplete }: AdminSetupProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create admin account
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role: "admin", // Set role as admin
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Admin account created successfully!");
        onComplete();
      } else {
        toast.error(`Failed to create admin: ${result.error}`);
        console.error("Admin creation error:", result.error);
      }
    } catch (error) {
      toast.error(`Error creating admin: ${error}`);
      console.error("Admin creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-900/90 backdrop-blur border-slate-700 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-full bg-purple-500/20 p-4 mb-4">
            <Shield className="h-12 w-12 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Setup</h1>
          <p className="text-gray-400 text-center">
            Create the first admin account to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Admin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Creating Admin..." : "Create Admin Account"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
            onClick={onComplete}
          >
            Skip - Use Platform as Member
          </Button>
        </form>
      </Card>
    </div>
  );
}