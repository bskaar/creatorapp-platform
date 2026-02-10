import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { EmailService } from '../services/emailService';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const { signUp } = useAuth();
  const { refreshSites } = useSite();
  const navigate = useNavigate();

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: validationData, error: validationError } = await supabase
        .rpc('validate_invitation_code', { code_text: invitationCode });

      if (validationError) {
        setError('Failed to validate invitation code. Please try again.');
        setLoading(false);
        return;
      }

      if (!validationData.valid) {
        setError(validationData.error || 'Invalid invitation code');
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await signUp(email, password, fullName);

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!signUpData?.user) {
        setError('Failed to create user account');
        setLoading(false);
        return;
      }

      const { error: useCodeError } = await supabase
        .rpc('use_invitation_code', {
          code_id_param: validationData.code_id,
          user_id_param: signUpData.user.id
        });

      if (useCodeError) {
        console.error('Failed to record code usage:', useCodeError);
      }

      try {
        await EmailService.sendWelcomeEmail(email, fullName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      await refreshSites();
      await new Promise(resolve => setTimeout(resolve, 500));

      if (selectedPlan) {
        navigate(`/site-setup?plan=${selectedPlan}`);
      } else {
        navigate('/site-setup');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-semibold transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-card shadow-light border border-border p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h2 className="text-4xl font-bold text-dark mb-3">Create Your Account</h2>
            <p className="text-text-secondary text-lg font-medium">
              Start building your creator business
            </p>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="invitationCode" className="block text-sm font-semibold text-text-primary mb-2">
                Invitation Code
              </label>
              <input
                id="invitationCode"
                type="text"
                required
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium uppercase"
                placeholder="Enter your invitation code"
              />
              <p className="mt-2 text-sm text-text-secondary">
                CreatorApp is currently in beta. Enter your invitation code to continue.
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-text-primary mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                placeholder="At least 8 characters"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-button hover:shadow-button-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center pt-4">
              <span className="text-text-secondary font-medium">Already have an account? </span>
              <Link to="/login" className="text-primary hover:text-accent font-bold transition">
                Sign in
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-text-secondary text-sm font-medium">
            &copy; 2025 CreatorApp. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
