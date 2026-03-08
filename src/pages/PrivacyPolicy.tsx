import { Shield, Mail } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function PrivacyPolicy() {
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
            <Shield className="h-4 w-4" />
            Legal
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Privacy <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-gray-300">
            Your privacy matters to us. Learn how we protect your data.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12">
            <p className="text-gray-500 mb-8 text-sm">Last updated: March 8, 2026</p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</span>
                  Information We Collect
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information you provide directly to us when you:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Create or modify your account</li>
                  <li>Use our services to create content, products, or campaigns</li>
                  <li>Contact us for support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</span>
                  How We Use Your Information
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Power AI features including the AI Co-Founder, content generation, and business recommendations</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</span>
                  AI Features and Data Processing
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  CreatorApp uses artificial intelligence to power several features including the AI Co-Founder, content generation,
                  theme generation, and business recommendations. Here's how we handle your data when using AI features:
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data Anonymization</h3>
                    <p className="text-gray-600 leading-relaxed">
                      When processing requests through our AI systems, we anonymize personally identifiable information (PII)
                      before sending data to AI model providers. This includes removing or masking email addresses, phone numbers,
                      names, and other identifying details from the content being processed.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Third-Party AI Providers</h3>
                    <p className="text-gray-600 leading-relaxed mb-2">
                      We use trusted third-party AI providers (including Anthropic and OpenAI) to process AI requests.
                      These providers:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Do not use your data to train their models (we use API access only)</li>
                      <li>Process data according to their respective privacy policies and data processing agreements</li>
                      <li>Are contractually bound to protect your information</li>
                      <li>Do not retain your prompts or outputs beyond processing the request</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Model Selection</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our system automatically selects the most appropriate AI model for each task based on complexity and requirements.
                      This intelligent routing helps ensure efficient processing while maintaining quality and cost-effectiveness.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">What We Store</h3>
                    <p className="text-gray-600 leading-relaxed mb-2">
                      For AI features, we may store:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Usage metrics to track your AI usage against plan limits</li>
                      <li>Aggregated, anonymized data to improve our services</li>
                      <li>Your generated content (such as gameplans) that you choose to save</li>
                      <li>Chat conversation history for continuity within sessions</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
                    <p className="text-gray-600 leading-relaxed">
                      You can choose not to use AI features at any time. Your core CreatorApp functionality does not require
                      AI feature usage. You may also request deletion of stored AI-related data through our support team.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">4</span>
                  Information Sharing
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We do not share, sell, rent, or trade your personal information with third parties for their promotional purposes.
                  We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>With your consent or at your direction</li>
                  <li>With service providers who perform services on our behalf</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">5</span>
                  Data Security
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access,
                  disclosure, alteration, and destruction. All data is encrypted in transit and at rest.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">6</span>
                  Data Retention
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your personal information for as long as necessary to provide you with our services and as described in this
                  Privacy Policy. When you delete your account, we will delete your personal information within 30 days.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">7</span>
                  Your Rights
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Correct inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Export your data in a portable format</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">8</span>
                  Cookies and Tracking
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our service and store certain information.
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">9</span>
                  Contact Us
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
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
