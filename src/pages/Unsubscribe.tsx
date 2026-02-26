import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<{
    email: string;
    firstName: string | null;
    alreadyUnsubscribed: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid unsubscribe link. Please check the link in your email.');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe?token=${token}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid unsubscribe link');
        return;
      }

      setContactInfo({
        email: data.email,
        firstName: data.firstName,
        alreadyUnsubscribed: data.alreadyUnsubscribed,
      });

      if (data.alreadyUnsubscribed) {
        setSuccess(true);
      }
    } catch (err) {
      setError('Unable to validate unsubscribe link. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, reason: reason || undefined }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to unsubscribe. Please try again.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Unable to process your request. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Validating your request...</p>
        </div>
      </div>
    );
  }

  if (error && !contactInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {contactInfo?.alreadyUnsubscribed ? 'Already Unsubscribed' : 'Successfully Unsubscribed'}
          </h1>
          <p className="text-gray-600 mb-2">
            {contactInfo?.email} has been removed from our mailing list.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will no longer receive marketing emails from us. Note that you may still receive
            transactional emails related to your account or purchases.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe from Emails</h1>
          <p className="text-gray-600">
            {contactInfo?.firstName ? `Hi ${contactInfo.firstName}, w` : 'W'}e're sorry to see you go.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            You are about to unsubscribe <strong>{contactInfo?.email}</strong> from our mailing list.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Help us improve (optional)
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a reason...</option>
            <option value="too_many_emails">Too many emails</option>
            <option value="not_relevant">Content not relevant to me</option>
            <option value="never_signed_up">I never signed up</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleUnsubscribe}
          disabled={submitting}
          className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Unsubscribe'
          )}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Changed your mind?{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            Return home
          </Link>{' '}
          without unsubscribing.
        </p>
      </div>
    </div>
  );
}
