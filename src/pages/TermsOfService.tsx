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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              All paid plans are billed in advance on a monthly or annual basis. There will be no refunds or credits for partial months
              of service, upgrade/downgrade refunds, or refunds for months unused with an open account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation and Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              You are solely responsible for properly canceling your account. You can cancel your account at any time by contacting
              our support team. All of your content will be immediately deleted from the service upon cancellation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Modifications to Service</h2>
            <p className="text-gray-700 leading-relaxed">
              CreatorApp reserves the right at any time to modify or discontinue the Service (or any part thereof) with or without notice.
              We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
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
