import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy" | "risk";
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const content = {
    terms: {
      title: "Terms of Service",
      text: `
        1. Acceptance of Terms
        By accessing and using Investoft ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

        2. Trading Risks
        Trading financial instruments involves a high degree of risk and may not be suitable for all investors. You acknowledge that you may lose some or all of your invested capital.

        3. User Obligations
        You agree to provide accurate information during registration and to maintain the security of your account credentials. You are responsible for all activities that occur under your account.

        4. Prohibited Activities
        Market manipulation, money laundering, and the use of automated trading bots (unless explicitly authorized) are strictly prohibited.

        5. Intellectual Property
        All content, trademarks, and technology on the Platform are the property of Investoft or its licensors.

        6. Termination
        We reserve the right to terminate or suspend your account at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.

        7. Disclaimer of Warranties
        The Platform is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted or error-free.
      `
    },
    privacy: {
      title: "Privacy Policy",
      text: `
        1. Information Collection
        We collect personal information such as your name, email address, and financial details when you register and use our services.

        2. Use of Information
        We use your information to provide and improve our services, process transactions, and communicate with you.

        3. Data Security
        We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.

        4. Information Sharing
        We do not sell your personal information. We may share data with trusted third-party service providers who assist us in operating our business.

        5. Cookies
        We use cookies to enhance your experience and analyze usage patterns. You can control cookie settings in your browser.

        6. Your Rights
        You have the right to access, correct, or delete your personal information. Please contact support for assistance.
      `
    },
    risk: {
      title: "Risk Disclosure",
      text: `
        1. General Risk Warning
        Trading in financial markets carries a high level of risk and can result in the loss of your entire investment. You should only invest money that you can afford to lose.

        2. Leverage Risk
        Trading with leverage can work against you as well as for you. Small market movements can result in large losses.

        3. Market Volatility
        Financial markets can be highly volatile. Prices can change rapidly due to economic events, news, and market sentiment.

        4. Technology Risk
        System failures, internet connectivity issues, and software glitches may affect your ability to execute trades. Investoft is not liable for losses caused by technical issues.

        5. No Financial Advice
        The information provided on the Platform is for educational purposes only and does not constitute financial advice. You should consult with a qualified financial advisor before making investment decisions.
      `
    }
  };

  const current = content[type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>
            Last updated: February 2026
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border border-slate-100 p-4">
          <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
            {current.text}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
