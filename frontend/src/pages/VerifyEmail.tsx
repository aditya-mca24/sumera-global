import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser, setToken } = useAuth();

  const token = searchParams.get('token');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setError('No verification token provided.');
        return;
      }

      setVerifying(true);
      try {
        const res = await apiFetch<{ user: typeof user; token: string }>(`/auth/verify-email`, {
          method: 'POST',
          body: { token },
        });

        if (res.user && res.token) {
          setUser(res.user);
          setToken(res.token);
          setVerified(true);
          setTimeout(() => {
            navigate('/account');
          }, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setVerifying(false);
      }
    }

    verifyEmail();
  }, [token, navigate, setUser, setToken]);

  async function handleResendVerification() {
    setResending(true);
    try {
      await apiFetch(`/auth/resend-verification`, {
        method: 'POST',
      });
      setError('');
      alert('Verification email sent successfully. Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-neutral-50 dark:bg-[#1a0a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {verifying ? (
          <div className="bg-white dark:bg-[#2e1547] rounded-2xl shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 size={48} className="text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-2">
                Verifying Email
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">Please wait while we verify your email address...</p>
            </div>
          </div>
        ) : verified ? (
          <div className="bg-white dark:bg-[#2e1547] rounded-2xl shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle size={48} className="text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Your email has been successfully verified. You can now access your account.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Redirecting to your account in a moment...
              </p>
            </div>
            <Link
              to="/account"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
            >
              Go to Account <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#2e1547] rounded-2xl shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-error-100 dark:bg-error-900/30 rounded-full blur-lg" />
                <AlertCircle size={48} className="text-error-600 dark:text-error-400 relative" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error || 'The verification link is invalid or has expired.'}
              </p>
            </div>

            {user && !user.is_email_verified && (
              <div className="space-y-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <p className="text-sm text-primary-900 dark:text-primary-200">
                  We can send you a new verification link.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} /> Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                to="/"
                className="flex-1 px-4 py-2 border border-neutral-200 dark:border-primary-800/40 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-[#3a1d5c] transition-colors font-medium"
              >
                Back to Home
              </Link>
              <Link
                to="/login"
                className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
