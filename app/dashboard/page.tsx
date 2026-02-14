'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserSession = {
  _id: string;
  role: 'customer' | 'admin';
};

type Appointment = {
  _id: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  serviceId?: {
    name?: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAppointments = async (userId: string) => {
    setLoading(true);
    const res = await fetch(`/api/appointments?userId=${userId}`);
    const data = (await res.json()) as { appointments?: Appointment[] };
    setAppointments(data.appointments || []);
    setLoading(false);
  };

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
    loadAppointments(parsed._id);
  }, [router]);

  const cancelAppointment = async (appointmentId: string) => {
    if (!user?._id) return;

    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', userId: user._id })
    });

    const data = (await res.json()) as { message?: string };

    if (!res.ok) {
      setMessage(data.message || 'Failed to cancel appointment');
      return;
    }

    setMessage('Appointment cancelled');
    loadAppointments(user._id);
  };

  return (
    <main className="container-base space-y-4">
      <h1 className="text-2xl font-semibold">Customer Dashboard</h1>

      {message && <p className="text-sm text-blue-700">{message}</p>}

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <div className="card text-gray-600">No appointments found.</div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold">{appointment.serviceId?.name || 'Service'}</p>
                <p className="text-sm text-gray-600">
                  {appointment.date} at {appointment.time}
                </p>
                <p className="text-sm">Status: <strong>{appointment.status}</strong></p>
              </div>

              {(appointment.status === 'pending' || appointment.status === 'approved') && (
                <button onClick={() => cancelAppointment(appointment._id)} className="button-secondary">
                  Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
