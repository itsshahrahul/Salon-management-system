'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  message?: string;
  user?: {
    role: 'admin' | 'customer';
    _id: string;
    name: string;
    email: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const data = (await res.json()) as RegisterResponse;

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
      <div className="card max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Register</h1>

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

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      </div>
    </main>
  );
}
