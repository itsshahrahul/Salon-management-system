'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type UserSession = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
};

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser) as UserSession);
    } else {
      setUser(null);
    }
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">The Beard Shop</Link>

        <div className="flex gap-3 items-center text-sm">
          <Link href="/services">Services</Link>
          {user?.role === 'customer' && <Link href="/book">Book</Link>}
          {user?.role === 'customer' && <Link href="/dashboard">Dashboard</Link>}
          {user?.role === 'admin' && <Link href="/admin">Admin</Link>}

          {!user && <Link href="/login">Login</Link>}
          {!user && <Link href="/register">Register</Link>}

          {user && (
            <button onClick={logout} className="button-secondary py-1 px-3">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
