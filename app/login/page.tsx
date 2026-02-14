'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type LoginForm = {
  email: string;
  password: string;
};

type LoginResponse = {
  message?: string;
  user?: {
    role: 'admin' | 'customer';
    _id: string;
    name: string;
    email: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const data = (await res.json()) as LoginResponse;

      if (!res.ok || !data.user) {
        setMessage(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
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

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && (
          <p className={`text-sm rounded-lg px-3 py-2 ${message.includes('wrong') || message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            {message}
          </p>
        )}

        <p className="text-xs text-gray-500">
          Demo Admin: <span className="font-medium">admin@beardshop.com / admin123</span>
        </p>
      </div>
    </main>
  );
}
