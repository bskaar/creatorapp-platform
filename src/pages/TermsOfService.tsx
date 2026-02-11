import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Mail } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-600 mb-8">Last updated: February 5, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using CreatorApp.us, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily use CreatorApp.us for personal or commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without proper subscription</li>
              <li>Attempt to reverse engineer any software contained on CreatorApp.us</li>
              <li>Remove any copyright or proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the security of your account and password. CreatorApp cannot and will not be liable
              for any loss or damage from your failure to comply with this security obligation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Free Trial Period</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              CreatorApp offers a 14-day free trial period for new subscribers to certain paid plans. A valid credit card is required to start your trial. During the trial period:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>You will have full access to all features included in your selected plan</li>
              <li>You will not be charged during the trial period</li>
              <li>You may cancel at any time before the trial ends without being charged</li>
              <li>If you do not cancel before the trial ends, your subscription will automatically convert to a paid subscription and your payment method will be charged</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <p className="text-gray-800 font-semibold mb-2">Important Trial Terms:</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                To avoid being charged, you must cancel your subscription before the end of the 14-day trial period.
                You will receive email notifications reminding you when your trial is about to end.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              After your free trial period ends (if applicable), all paid plans are billed in advance on a monthly or annual basis
              according to the billing cycle you selected during signup.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Monthly subscriptions are billed every 30 days</li>
              <li>Annual subscriptions are billed once per year</li>
              <li>Payment is due immediately upon subscription or renewal</li>
              <li>All fees are in U.S. Dollars unless otherwise stated</li>
              <li>You authorize us to charge your payment method for all fees due</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              CreatorApp offers the following refund policies:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">During Free Trial:</h3>
                <p className="text-gray-700 leading-relaxed">
                  No refunds are necessary during the trial period as you are not charged. Simply cancel before the trial ends
                  to avoid any charges.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">After Trial Period:</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Once your paid subscription begins after the trial period, the following refund policy applies:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Refund requests must be submitted within 30 days of being charged</li>
                  <li>Refunds are issued at our discretion and evaluated on a case-by-case basis</li>
                  <li>To request a refund, contact support@creatorapp.us with your account details and reason for refund</li>
                  <li>Partial refunds for unused time are not provided for monthly subscriptions</li>
                  <li>Annual subscriptions may be eligible for prorated refunds within the first 60 days</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Non-Refundable Items:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Upgrade/downgrade refunds</li>
                  <li>Refunds for months unused with an open account</li>
                  <li>Add-on services or one-time purchases</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancellation and Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are solely responsible for properly canceling your account. You can cancel your subscription at any time through
              your account settings or by contacting our support team at support@creatorapp.us.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation During Trial:</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you cancel during your 14-day trial period, you will not be charged and your account will remain active until
                  the end of the trial period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation After Trial:</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you cancel after your paid subscription has started, you will continue to have access to your account until the
                  end of your current billing period. No refunds will be issued for the remaining time in your billing cycle.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Retention:</h3>
                <p className="text-gray-700 leading-relaxed">
                  After cancellation, your content and data will be retained for 30 days, after which it will be permanently deleted.
                  We recommend exporting any important data before canceling.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications to Service</h2>
            <p className="text-gray-700 leading-relaxed">
              CreatorApp reserves the right at any time to modify or discontinue the Service (or any part thereof) with or without notice.
              We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Questions about the Terms of Service should be sent to us at:
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Email Support</span>
              </div>
              <a
                href="mailto:support@creatorapp.us"
                className="text-blue-600 hover:text-blue-700 font-medium text-lg"
              >
                support@creatorapp.us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
