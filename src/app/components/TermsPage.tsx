import { AlertTriangle, FileText, Shield, Scale } from "lucide-react";
import { Link } from "react-router";

/**
 * Terms & Conditions Page
 * Legal disclaimers and user agreements for Investoft
 */
export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Terms & Conditions</h1>
                <p className="text-slate-400 mt-2">Last Updated: February 22, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-yellow-400 mb-2">Important Notice</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Please read these Terms & Conditions carefully before using Investoft. By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Section 1: Acceptance of Terms */}
            <TermsSection
              number="1"
              title="Acceptance of Terms"
              icon={<Scale className="w-6 h-6 text-blue-400" />}
            >
              <p className="mb-4">
                By accessing and using the Investoft platform ("Platform", "Service", "we", "us", "our"), you ("User", "you", "your") accept and agree to be bound by the terms and provisions of this agreement.
              </p>
              <p>
                If you do not agree to these Terms & Conditions, you must not access or use the Platform.
              </p>
            </TermsSection>

            {/* Section 2: Platform Description */}
            <TermsSection
              number="2"
              title="Platform Description & Nature of Services"
              icon={<FileText className="w-6 h-6 text-purple-400" />}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">2.1 Practice Trading Platform</h4>
                  <p>
                    Investoft is a <strong className="text-blue-400">practice and educational trading platform</strong>. All trading activities conducted on this Platform are <strong>simulated</strong> and use <strong>virtual funds only</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">2.2 No Real Money Trading</h4>
                  <p className="mb-2">The Platform does NOT:</p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                    <li>Accept real money deposits</li>
                    <li>Execute real trades on any cryptocurrency exchange</li>
                    <li>Provide real money withdrawals</li>
                    <li>Generate actual profits or losses</li>
                    <li>Hold, custody, or manage real cryptocurrency assets</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">2.3 Educational Purpose</h4>
                  <p>
                    The Platform is designed solely for educational and training purposes to help users learn about cryptocurrency trading mechanics, market dynamics, and trading strategies in a risk-free environment.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">2.4 Real-Time Market Data</h4>
                  <p>
                    While we use real-time market data from Binance API to simulate realistic trading conditions, all trades executed on the Platform are purely virtual and have no impact on real markets.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Section 3: Risk Disclosure */}
            <TermsSection
              number="3"
              title="Risk Disclosure & Disclaimer"
              icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
            >
              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                  <h4 className="font-bold text-lg text-red-400 mb-3">⚠️ Important Risk Warning</h4>
                  <p className="mb-4">
                    <strong>Cryptocurrency trading involves substantial risk of loss.</strong> The cryptocurrency market is highly volatile and unpredictable.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>Success in practice trading does NOT guarantee success in real trading</li>
                    <li>Past performance is NOT indicative of future results</li>
                    <li>You may lose all invested capital in real trading</li>
                    <li>Practice trading does not reflect real-world factors such as slippage, liquidity, and emotional pressure</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3.1 No Investment Advice</h4>
                  <p>
                    The Platform does NOT provide investment, financial, legal, or tax advice. Nothing on this Platform should be construed as a recommendation to buy, sell, or hold any cryptocurrency or financial instrument.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">3.2 Consult Professionals</h4>
                  <p>
                    Before engaging in real cryptocurrency trading, you should consult with licensed financial advisors, tax professionals, and legal counsel to understand the risks and implications.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Section 4: User Accounts */}
            <TermsSection
              number="4"
              title="User Accounts & Registration"
              icon={<Shield className="w-6 h-6 text-green-400" />}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">4.1 Account Creation</h4>
                  <p>
                    To use the Platform, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">4.2 Eligibility</h4>
                  <p>You must be at least 18 years old to use this Platform. By registering, you represent that:</p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                    <li>You are of legal age in your jurisdiction</li>
                    <li>You have the legal capacity to enter into this agreement</li>
                    <li>All information provided is accurate and truthful</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">4.3 Virtual Balance</h4>
                  <p>
                    All accounts are provided with a virtual balance for practice trading purposes. This balance has no real-world monetary value and cannot be withdrawn, exchanged, or converted to real currency.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">4.4 Account Security</h4>
                  <p>
                    You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use or security breach.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Section 5: Acceptable Use */}
            <TermsSection
              number="5"
              title="Acceptable Use Policy"
            >
              <div className="space-y-4">
                <p>You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>Use the Platform for any illegal or unauthorized purpose</li>
                  <li>Attempt to manipulate, hack, or exploit the Platform</li>
                  <li>Interfere with or disrupt the Platform's operation</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Use automated systems (bots) without authorization</li>
                  <li>Impersonate others or misrepresent your identity</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Transmit malware, viruses, or harmful code</li>
                </ul>
              </div>
            </TermsSection>

            {/* Section 6: Intellectual Property */}
            <TermsSection
              number="6"
              title="Intellectual Property Rights"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">6.1 Platform Ownership</h4>
                  <p>
                    All content, features, functionality, designs, logos, and trademarks on the Platform are owned by Investoft and protected by international copyright, trademark, and other intellectual property laws.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">6.2 Limited License</h4>
                  <p>
                    We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, educational purposes only.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">6.3 Restrictions</h4>
                  <p>
                    You may not copy, modify, distribute, sell, or lease any part of the Platform without our express written permission.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Section 7: Data & Privacy */}
            <TermsSection
              number="7"
              title="Data Collection & Privacy"
            >
              <div className="space-y-4">
                <p>
                  We collect and process personal data in accordance with our Privacy Policy. By using the Platform, you consent to such processing.
                </p>
                
                <div>
                  <h4 className="font-bold text-lg mb-2">7.1 Data We Collect</h4>
                  <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                    <li>Account information (email, name)</li>
                    <li>Trading activity and platform usage data</li>
                    <li>Device and browser information</li>
                    <li>IP addresses and location data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">7.2 Data Security</h4>
                  <p>
                    We implement industry-standard security measures to protect your data. However, no system is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Section 8: Market Data */}
            <TermsSection
              number="8"
              title="Market Data & Accuracy"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">8.1 Data Sources</h4>
                  <p>
                    Market data is provided by third-party sources (primarily Binance API). We strive to provide accurate, real-time data but do not guarantee its accuracy, completeness, or timeliness.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">8.2 No Liability for Data Errors</h4>
                  <p>
                    We are not liable for any errors, delays, or interruptions in market data. Users acknowledge that data may be subject to delays or inaccuracies.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">8.3 Data Usage</h4>
                  <p>
                    Market data is provided for informational and educational purposes only. It should not be used as the sole basis for real trading decisions.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Section 9: Disclaimers */}
            <TermsSection
              number="9"
              title="Disclaimers & Limitations of Liability"
            >
              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-3">9.1 "AS IS" Provision</h4>
                  <p className="mb-3">
                    THE PLATFORM IS PROVIDED ON AN <strong>"AS IS"</strong> AND <strong>"AS AVAILABLE"</strong> BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                  </p>
                  <p>
                    We do not warrant that the Platform will be uninterrupted, error-free, secure, or free from viruses or other harmful components.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">9.2 No Guarantee of Results</h4>
                  <p>
                    We make no guarantees regarding trading results, platform performance, or learning outcomes. Your success depends on many factors beyond our control.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">9.3 Limitation of Liability</h4>
                  <p className="mb-2">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, INVESTOFT SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                    <li>Any indirect, incidental, special, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Trading losses in real markets based on platform experience</li>
                    <li>Interruptions or unavailability of the Platform</li>
                    <li>Third-party actions or data accuracy</li>
                  </ul>
                </div>
              </div>
            </TermsSection>

            {/* Section 10: Termination */}
            <TermsSection
              number="10"
              title="Termination & Suspension"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">10.1 Termination by User</h4>
                  <p>
                    You may terminate your account at any time by discontinuing use of the Platform and deleting your account (if applicable).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">10.2 Termination by Us</h4>
                  <p>
                    We reserve the right to suspend or terminate your account at any time, with or without notice, for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                    <li>Violation of these Terms & Conditions</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Abuse of the Platform</li>
                    <li>Any reason at our sole discretion</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">10.3 Effect of Termination</h4>
                  <p>
                    Upon termination, your right to use the Platform ceases immediately. All virtual balances and data may be deleted.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Section 11: Changes to Terms */}
            <TermsSection
              number="11"
              title="Changes to Terms & Conditions"
            >
              <p className="mb-4">
                We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting to the Platform.
              </p>
              <p>
                Your continued use of the Platform after changes are posted constitutes acceptance of the modified terms. We encourage you to review these terms periodically.
              </p>
            </TermsSection>

            {/* Section 12: Governing Law */}
            <TermsSection
              number="12"
              title="Governing Law & Jurisdiction"
            >
              <p className="mb-4">
                These Terms & Conditions shall be governed by and construed in accordance with applicable international laws for digital services.
              </p>
              <p>
                Any disputes arising from these terms or use of the Platform shall be resolved through good faith negotiation or, if necessary, through binding arbitration.
              </p>
            </TermsSection>

            {/* Section 13: Contact */}
            <TermsSection
              number="13"
              title="Contact Information"
            >
              <p className="mb-4">
                If you have questions about these Terms & Conditions, please contact us through the Platform's support system.
              </p>
              <p className="text-slate-400 text-sm">
                For general inquiries, you can reach out via the contact form on our website or through the member dashboard support feature.
              </p>
            </TermsSection>

            {/* Acceptance */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-500/30 rounded-xl p-8 mt-12">
              <h3 className="text-2xl font-bold mb-4 text-center">Acknowledgment</h3>
              <p className="text-slate-300 text-center leading-relaxed">
                By using Investoft, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions, including the risk disclosures and disclaimers herein.
              </p>
              <div className="mt-6 text-center">
                <Link to="/">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    Return to Home
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Component
interface TermsSectionProps {
  number: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function TermsSection({ number, title, icon, children }: TermsSectionProps) {
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6 md:p-8">
      <div className="flex items-start gap-4 mb-6">
        {icon && <div className="shrink-0 mt-1">{icon}</div>}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">
            {number}. {title}
          </h2>
        </div>
      </div>
      <div className="text-slate-300 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}

// ✅ Default export for lazy loading
export default TermsPage;