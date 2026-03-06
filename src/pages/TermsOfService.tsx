import { FileText, Mail } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900">
      <PublicHeader variant="dark" />

      <section className="pt-28 pb-12 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <FileText className="h-4 w-4" />
            Legal
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Terms of <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-xl text-gray-300">
            Please read these terms carefully before using our service.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12">
            <p className="text-gray-500 mb-8 text-sm">Last updated: February 5, 2026</p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</span>
                  Acceptance of Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using CreatorApp.us, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</span>
                  Use License
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Permission is granted to temporarily use CreatorApp.us for personal or commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without proper subscription</li>
                  <li>Attempt to reverse engineer any software contained on CreatorApp.us</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</span>
                  Account Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You are responsible for maintaining the security of your account and password. CreatorApp cannot and will not be liable
                  for any loss or damage from your failure to comply with this security obligation.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">4</span>
                  Free Trial Period
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  CreatorApp offers a 14-day free trial period for new subscribers to certain paid plans. A valid credit card is required to start your trial. During the trial period:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>You will have full access to all features included in your selected plan</li>
                  <li>You will not be charged during the trial period</li>
                  <li>You may cancel at any time before the trial ends without being charged</li>
                  <li>If you do not cancel before the trial ends, your subscription will automatically convert to a paid subscription and your payment method will be charged</li>
                </ul>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r-xl">
                  <p className="text-gray-800 font-semibold mb-2">Important Trial Terms:</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    To avoid being charged, you must cancel your subscription before the end of the 14-day trial period.
                    You will receive email notifications reminding you when your trial is about to end.
                  </p>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">5</span>
                  Payment Terms
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  After your free trial period ends (if applicable), all paid plans are billed in advance on a monthly or annual basis
                  according to the billing cycle you selected during signup.
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Monthly subscriptions are billed every 30 days</li>
                  <li>Annual subscriptions are billed once per year</li>
                  <li>Payment is due immediately upon subscription or renewal</li>
                  <li>All fees are in U.S. Dollars unless otherwise stated</li>
                  <li>You authorize us to charge your payment method for all fees due</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">6</span>
                  Refund Policy
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  CreatorApp offers the following refund policies:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">During Free Trial:</h3>
                    <p className="text-gray-600 leading-relaxed">
                      No refunds are necessary during the trial period as you are not charged. Simply cancel before the trial ends
                      to avoid any charges.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">After Trial Period:</h3>
                    <p className="text-gray-600 leading-relaxed mb-2">
                      Once your paid subscription begins after the trial period, the following refund policy applies:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>Refund requests must be submitted within 30 days of being charged</li>
                      <li>Refunds are issued at our discretion and evaluated on a case-by-case basis</li>
                      <li>To request a refund, contact support@creatorapp.us with your account details and reason for refund</li>
                      <li>Partial refunds for unused time are not provided for monthly subscriptions</li>
                      <li>Annual subscriptions may be eligible for prorated refunds within the first 60 days</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Non-Refundable Items:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>Upgrade/downgrade refunds</li>
                      <li>Refunds for months unused with an open account</li>
                      <li>Add-on services or one-time purchases</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">7</span>
                  Cancellation and Termination
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You are solely responsible for properly canceling your account. You can cancel your subscription at any time through
                  your account settings or by contacting our support team at support@creatorapp.us.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation During Trial:</h3>
                    <p className="text-gray-600 leading-relaxed">
                      If you cancel during your 14-day trial period, you will not be charged and your account will remain active until
                      the end of the trial period.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation After Trial:</h3>
                    <p className="text-gray-600 leading-relaxed">
                      If you cancel after your paid subscription has started, you will continue to have access to your account until the
                      end of your current billing period. No refunds will be issued for the remaining time in your billing cycle.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data Retention:</h3>
                    <p className="text-gray-600 leading-relaxed">
                      After cancellation, your content and data will be retained for 30 days, after which it will be permanently deleted.
                      We recommend exporting any important data before canceling.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">8</span>
                  Modifications to Service
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  CreatorApp reserves the right at any time to modify or discontinue the Service (or any part thereof) with or without notice.
                  We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">9</span>
                  Contact Information
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Questions about the Terms of Service should be sent to us at:
                </p>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-cyan-500 p-6 rounded-r-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-cyan-600" />
                    <span className="font-semibold text-gray-900">Email Support</span>
                  </div>
                  <a
                    href="mailto:support@creatorapp.us"
                    className="text-cyan-600 hover:text-cyan-700 font-medium text-lg"
                  >
                    support@creatorapp.us
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
