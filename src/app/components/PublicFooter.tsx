import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { LegalModal } from "./LegalModal";
import { AdminLoginModal } from "./AdminLoginModal";
import { Link, useNavigate } from "react-router";

export function PublicFooter() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalType, setLegalType] = useState<"terms" | "privacy" | "risk">("terms");
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const navigate = useNavigate();

  const openLegal = (type: "terms" | "privacy" | "risk") => {
    setLegalType(type);
    setLegalModalOpen(true);
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8 text-slate-400">
      <div className="container mx-auto px-4">
        {/* Main Footer Grid - Simetris 4 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6 cursor-pointer">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded p-1">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Investoft</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Professional trading platform for learning cryptocurrency markets with real-time data.
            </p>
          </div>
          
          {/* Column 2: Products & Markets */}
          <div>
            <h4 className="font-bold text-white mb-4">Trading</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/markets" className="hover:text-blue-400 transition-colors">Markets</Link></li>
              <li><Link to="/cryptocurrency" className="hover:text-blue-400 transition-colors">Cryptocurrency</Link></li>
              <li><Link to="/screener" className="hover:text-blue-400 transition-colors">Screener</Link></li>
              <li><Link to="/markets?filter=crypto" className="hover:text-blue-400 transition-colors">Crypto Trading</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-bold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms & Conditions</Link></li>
              <li><button onClick={() => openLegal("privacy")} className="text-sm hover:text-blue-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => openLegal("risk")} className="text-sm hover:text-blue-400 transition-colors text-left">Risk Disclosure</button></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
              <li><Link to="/deposit" className="hover:text-blue-400 transition-colors">Deposit</Link></li>
              <li><a href="#help" className="hover:text-blue-400 transition-colors">Help Center</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm gap-4">
          <p className="text-center md:text-left">
            &copy; 2026 Investoft
            <span 
              onClick={() => setAdminLoginOpen(true)}
              className="cursor-pointer hover:text-red-400 transition-colors select-none"
              title="Admin Access"
            >
              .
            </span> All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-sm hover:text-blue-400 transition-colors">Terms</Link>
            <button onClick={() => openLegal("privacy")} className="text-sm hover:text-blue-400 transition-colors">Privacy</button>
            <button onClick={() => openLegal("risk")} className="text-sm hover:text-blue-400 transition-colors">Risk Disclosure</button>
          </div>
        </div>
      </div>

      <LegalModal 
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalType}
      />

      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={() => {}}
      />
    </footer>
  );
}