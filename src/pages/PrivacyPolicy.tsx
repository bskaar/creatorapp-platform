import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="prose max-w-none">
          <p>Last updated: December 3, 2025</p>
          <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your data.</p>
        </div>
      </div>
    </div>
  );
}
