import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { LegalModal } from "./LegalModal";

interface PublicFooterProps {
  onNavigate: (view: string) => void;
  onGetStarted: () => void;
}

export function PublicFooter({ onNavigate, onGetStarted }: PublicFooterProps) {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState<"terms" | "privacy" | "risk">("terms");

  const openLegal = (type: "terms" | "privacy" | "risk") => {
    setLegalType(type);
    setLegalModalOpen(true);
  };

  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8 text-slate-600">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => onNavigate("landing")}>
              <div className="bg-blue-600 rounded p-1">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Investoft</span>
            </div>
            <p className="text-sm">
              Advanced trading platform for everyone. Trade with confidence and precision.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate("charts")} className="hover:text-blue-600 text-left">Chart</button></li>
              <li><button onClick={() => onNavigate("screener")} className="hover:text-blue-600 text-left">Screener</button></li>
              <li><button onClick={onGetStarted} className="hover:text-blue-600 text-left">Trading Platform</button></li>
              <li><button onClick={() => onNavigate("charts")} className="hover:text-blue-600 text-left">Indicators</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Markets</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate("markets")} className="hover:text-blue-600 text-left">Stocks</button></li>
              <li><button onClick={() => onNavigate("markets")} className="hover:text-blue-600 text-left">Forex</button></li>
              <li><button onClick={() => onNavigate("markets")} className="hover:text-blue-600 text-left">Crypto</button></li>
              <li><button onClick={() => onNavigate("markets")} className="hover:text-blue-600 text-left">Commodities</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate("news")} className="hover:text-blue-600 text-left">Trading Ideas</button></li>
              <li><button onClick={() => onNavigate("charts")} className="hover:text-blue-600 text-left">Scripts</button></li>
              <li><button onClick={() => onNavigate("landing")} className="hover:text-blue-600 text-left">Education</button></li>
              <li><button onClick={() => onNavigate("news")} className="hover:text-blue-600 text-left">Blog</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate("landing")} className="hover:text-blue-600 text-left">About</button></li>
              <li><button onClick={() => {}} className="hover:text-blue-600 text-left">Careers</button></li>
              <li><button onClick={() => {}} className="hover:text-blue-600 text-left">Contact</button></li>
              <li><button onClick={() => {}} className="hover:text-blue-600 text-left">Support</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>&copy; 2026 Investoft. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <button onClick={() => openLegal("terms")} className="hover:text-blue-600">Terms</button>
             <button onClick={() => openLegal("privacy")} className="hover:text-blue-600">Privacy</button>
             <button onClick={() => openLegal("risk")} className="hover:text-blue-600">Risk Disclosure</button>
          </div>
        </div>
      </div>

      <LegalModal 
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalType}
      />
    </footer>
  );
}
