'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const linkClass = (href: string) =>
    `px-2 py-1 rounded-md transition ${pathname === href ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl tracking-tight">The Beard Shop</Link>

        <div className="flex gap-3 items-center text-sm">
          <Link href="/services" className={linkClass('/services')}>Services</Link>
          {user?.role === 'customer' && <Link href="/book" className={linkClass('/book')}>Book</Link>}
          {user?.role === 'customer' && <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>}
          {user?.role === 'admin' && <Link href="/admin" className={linkClass('/admin')}>Admin</Link>}

          {!user && <Link href="/login" className={linkClass('/login')}>Login</Link>}
          {!user && <Link href="/register" className={linkClass('/register')}>Register</Link>}

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
