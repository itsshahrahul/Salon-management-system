'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type UserSession = {
  _id: string;
  role: 'customer' | 'admin';
};

type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number;
};

function BookPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState(searchParams.get('serviceId') || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsed = JSON.parse(storedUser) as UserSession;
    if (parsed.role !== 'customer') {
      router.push('/admin');
      return;
    }

    setUser(parsed);

    const loadServices = async () => {
      const res = await fetch('/api/services');
      const data = (await res.json()) as { services?: Service[] };
      setServices(data.services || []);
    };

    loadServices();
  }, [router]);

  const serviceInfo = services.find((service) => service._id === selectedService);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    if (!selectedService || !date || !time || !user?._id) {
      setMessage('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          serviceId: selectedService,
          date,
          time
        })
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        setMessage(data.message || 'Booking failed');
        return;
      }

      setMessage('Appointment booked successfully');
      setSelectedService('');
      setDate('');
      setTime('');
    } catch (_error) {
      setMessage('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-base space-y-5">
      <div>
        <h1 className="section-title">Book Appointment</h1>
        <p className="muted mt-1">Choose your service, preferred date, and time slot.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <select
            className="input"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">Select Service</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} - NPR {service.price}
              </option>
            ))}
          </select>

          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            className="input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </form>

        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Booking Summary</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Service:</strong> {serviceInfo?.name || '-'}</p>
            <p><strong>Price:</strong> {serviceInfo ? `NPR ${serviceInfo.price}` : '-'}</p>
            <p><strong>Duration:</strong> {serviceInfo ? `${serviceInfo.duration} min` : '-'}</p>
            <p><strong>Date:</strong> {date || '-'}</p>
            <p><strong>Time:</strong> {time || '-'}</p>
          </div>
        </div>
      </div>

      {message && (
        <p className={`text-sm rounded-lg px-3 py-2 ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </p>
      )}
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<main className="container-base">Loading...</main>}>
      <BookPageContent />
    </Suspense>
  );
}
