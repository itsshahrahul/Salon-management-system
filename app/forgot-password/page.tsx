'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');

    if (!form.email || !form.newPassword || !form.confirmPassword) {
      setMessage('Please fill all fields');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          newPassword: form.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Failed to reset password');
        return;
      }

      setMessage(data.message || 'Password reset successful. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1200);
    } catch (_error) {
      setMessage('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-base">
      <div className="card max-w-md mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Account recovery</p>
          <h1 className="text-3xl font-bold mt-1">Forgot Password</h1>
          <p className="muted mt-1">Enter your email and set a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <div className="relative">
            <input
              className="input pr-20"
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="relative">
            <input
              className="input pr-20"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <p className={`text-sm rounded-lg px-3 py-2 ${message.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </p>
        )}

        <p className="text-sm text-gray-600">
          Back to{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
