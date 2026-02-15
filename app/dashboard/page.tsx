'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getStatusClass(status: string) {
  if (status === 'approved') return 'badge-approved';
  if (status === 'rejected') return 'badge-rejected';
  if (status === 'cancelled') return 'badge-cancelled';
  return 'badge-pending';
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAppointments = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?userId=${userId}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (_error) {
      setAppointments([]);
      setMessage('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsed = JSON.parse(storedUser);

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

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || 'Failed to cancel appointment');
      return;
    }

    setMessage('Appointment cancelled');
    loadAppointments(user._id);
  };

  return (
    <main className="container-base space-y-5">
      <div>
        <h1 className="section-title">Customer Dashboard</h1>
        <p className="muted mt-1">Track your booked appointments and cancel when needed.</p>
      </div>

      {message && <p className="text-sm rounded-lg bg-blue-50 text-blue-700 px-3 py-2">{message}</p>}

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
                <p className="text-sm mt-2">
                  Status:{' '}
                  <span className={`badge ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </p>
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
