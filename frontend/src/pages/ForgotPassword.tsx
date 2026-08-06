import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setMessage('If an account exists for this email, a reset link has been prepared.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-16 bg-neutral-50 dark:bg-[#1a0a2e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">SUREMA</Link>
            <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mt-4 mb-1">Forgot Password</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="priya@example.com"
              />
            </div>

            {error && <p className="text-error-600 dark:text-error-400 text-sm bg-error-50 dark:bg-error-900/20 px-3 py-2 rounded-lg">{error}</p>}
            {message && <p className="text-success-600 dark:text-success-400 text-sm bg-success-50 dark:bg-success-900/20 px-3 py-2 rounded-lg">{message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
