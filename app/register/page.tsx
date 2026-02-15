'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');

    if (!form.name || !form.email || !form.password) {
      setMessage('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        setMessage(data.message || 'Registration failed');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
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
          <p className="text-xs uppercase tracking-wide text-gray-500">Create account</p>
          <h1 className="text-3xl font-bold mt-1">Register</h1>
          <p className="muted mt-1">Join The Beard Shop to book appointments in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input"
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
          />

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
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {message && (
          <p className={`text-sm rounded-lg px-3 py-2 ${message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
