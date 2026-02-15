'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');

    if (!form.email || !form.password) {
      setMessage('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        setMessage(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (_error) {
      setMessage('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-base">
      <div className="card max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="flex justify-center md:justify-center">
            <Image
              src="/images/barber2.png"
              alt="Barber Login"
              width={360}
              height={280}
              className="w-full max-w-xs md:max-w-md rounded-xl border border-gray-200 object-cover"
              priority
            />
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Welcome back</p>
              <h1 className="text-3xl font-bold mt-1">Login</h1>
              <p className="muted mt-1">Access your account to continue booking and managing appointments.</p>
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
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </form>

            {message && (
              <p className={`text-sm rounded-lg px-3 py-2 ${message.includes('wrong') || message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
