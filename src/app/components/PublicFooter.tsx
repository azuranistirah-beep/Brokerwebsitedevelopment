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
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6 cursor-pointer">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded p-1">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Investoft</span>
            </Link>
            <p className="text-sm">
              Advanced trading platform for everyone. Trade with confidence and precision.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cryptocurrency" className="hover:text-blue-400 transition-colors">Cryptocurrency</Link></li>
              <li><Link to="/screener" className="hover:text-blue-400 transition-colors">Screener</Link></li>
              <li><Link to="/markets" className="hover:text-blue-400 transition-colors">Trading Platform</Link></li>
              <li><Link to="/cryptocurrency" className="hover:text-blue-400 transition-colors">Indicators</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Markets</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/markets?filter=stocks" className="hover:text-blue-400 transition-colors">Stocks</Link></li>
              <li><Link to="/markets?filter=forex" className="hover:text-blue-400 transition-colors">Forex</Link></li>
              <li><Link to="/markets?filter=crypto" className="hover:text-blue-400 transition-colors">Crypto</Link></li>
              <li><Link to="/markets?filter=commodities" className="hover:text-blue-400 transition-colors">Commodities</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/screener" className="hover:text-blue-400 transition-colors">Trading Ideas</Link></li>
              <li><Link to="/cryptocurrency" className="hover:text-blue-400 transition-colors">Scripts</Link></li>
              <li><a href="#education" className="hover:text-blue-400 transition-colors">Education</a></li>
              <li><a href="#blog" className="hover:text-blue-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#careers" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#support" className="hover:text-blue-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>
            &copy; 2026 Investoft
            <span 
              onClick={() => setAdminLoginOpen(true)}
              className="cursor-pointer hover:text-red-400 transition-colors select-none"
              title="Admin Access"
            >
              .
            </span> All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <button onClick={() => openLegal("terms")} className="hover:text-blue-400">Terms</button>
             <button onClick={() => openLegal("privacy")} className="hover:text-blue-400">Privacy</button>
             <button onClick={() => openLegal("risk")} className="hover:text-blue-400">Risk Disclosure</button>
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