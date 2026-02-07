import { Card } from "../../ui/card";
import { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="bg-slate-900 border-slate-800 p-12 text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-purple-500/10 rounded-full">
            <Icon className="h-16 w-16 text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-gray-400">{description}</p>
        <p className="text-gray-500 text-sm mt-4">This page is coming soon...</p>
      </Card>
    </div>
  );
}
