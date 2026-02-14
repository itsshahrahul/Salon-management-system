'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserSession = {
  _id: string;
  role: 'customer' | 'admin';
};

type Stats = {
  totalServices: number;
  pendingBookings: number;
  approvedBookings: number;
};

type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  description: string;
};

type Appointment = {
  _id: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  userId?: { name?: string };
  serviceId?: { name?: string };
};

type ServiceForm = {
  name: string;
  price: string;
  duration: string;
  category: string;
  description: string;
};

const initialServiceForm: ServiceForm = {
  name: '',
  price: '',
  duration: '',
  category: '',
  description: ''
};

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<UserSession | null>(null);

  const [stats, setStats] = useState<Stats>({ totalServices: 0, pendingBookings: 0, approvedBookings: 0 });
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [serviceForm, setServiceForm] = useState<ServiceForm>(initialServiceForm);
  const [editServiceId, setEditServiceId] = useState('');
  const [message, setMessage] = useState('');

  const loadAllData = async (adminId: string) => {
    const [statsRes, servicesRes, appointmentsRes] = await Promise.all([
      fetch(`/api/admin/stats?adminId=${adminId}`),
      fetch('/api/services'),
      fetch(`/api/appointments?adminId=${adminId}`)
    ]);

    const statsData = (await statsRes.json()) as Stats;
    const servicesData = (await servicesRes.json()) as { services?: Service[] };
    const appointmentsData = (await appointmentsRes.json()) as { appointments?: Appointment[] };

    if (statsRes.ok) setStats(statsData);
    setServices(servicesData.services || []);
    setAppointments(appointmentsData.appointments || []);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsed = JSON.parse(storedUser) as UserSession;

    if (parsed.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setAdmin(parsed);
    loadAllData(parsed._id);
  }, [router]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const submitService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    const { name, price, duration, category, description } = serviceForm;

    if (!name || !price || !duration || !category || !description) {
      setMessage('Please fill all service fields');
      return;
    }

    const isEdit = Boolean(editServiceId);
    const endpoint = isEdit ? `/api/services/${editServiceId}` : '/api/services';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...serviceForm, adminId: admin?._id })
    });

    const data = (await res.json()) as { message?: string };

    if (!res.ok) {
      setMessage(data.message || 'Action failed');
      return;
    }

    setMessage(isEdit ? 'Service updated' : 'Service added');
    setServiceForm(initialServiceForm);
    setEditServiceId('');
    if (admin?._id) {
      loadAllData(admin._id);
    }
  };

  const startEditService = (service: Service) => {
    setEditServiceId(service._id);
    setServiceForm({
      name: service.name,
      price: String(service.price),
      duration: String(service.duration),
      category: service.category,
      description: service.description
    });
  };

  const deleteService = async (serviceId: string) => {
    const res = await fetch(`/api/services/${serviceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: admin?._id })
    });

    const data = (await res.json()) as { message?: string };

    if (!res.ok) {
      setMessage(data.message || 'Delete failed');
      return;
    }

    setMessage('Service deleted');
    if (admin?._id) {
      loadAllData(admin._id);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminId: admin?._id })
    });

    const data = (await res.json()) as { message?: string };

    if (!res.ok) {
      setMessage(data.message || 'Failed to update appointment');
      return;
    }

    setMessage(`Appointment ${status}`);
    if (admin?._id) {
      loadAllData(admin._id);
    }
  };

  return (
    <main className="container-base space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {message && <p className="text-sm text-blue-700">{message}</p>}

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Services</p>
          <p className="text-2xl font-bold">{stats.totalServices}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Pending Bookings</p>
          <p className="text-2xl font-bold">{stats.pendingBookings}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Approved Bookings</p>
          <p className="text-2xl font-bold">{stats.approvedBookings}</p>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Manage Services</h2>

        <form onSubmit={submitService} className="grid md:grid-cols-2 gap-3">
          <input className="input" name="name" placeholder="Name" value={serviceForm.name} onChange={handleServiceChange} />
          <input className="input" name="price" type="number" min="0" placeholder="Price" value={serviceForm.price} onChange={handleServiceChange} />
          <input className="input" name="duration" type="number" min="1" placeholder="Duration (min)" value={serviceForm.duration} onChange={handleServiceChange} />
          <input className="input" name="category" placeholder="Category" value={serviceForm.category} onChange={handleServiceChange} />
          <input className="input md:col-span-2" name="description" placeholder="Description" value={serviceForm.description} onChange={handleServiceChange} />

          <div className="md:col-span-2 flex gap-2">
            <button className="button-primary" type="submit">{editServiceId ? 'Update Service' : 'Add Service'}</button>
            {editServiceId && (
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setEditServiceId('');
                  setServiceForm(initialServiceForm);
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id} className="border-b">
                  <td className="py-2">{service.name}</td>
                  <td>{service.category}</td>
                  <td>NPR {service.price}</td>
                  <td>{service.duration} min</td>
                  <td className="space-x-2">
                    <button className="button-secondary py-1" onClick={() => startEditService(service)}>Edit</button>
                    <button className="button-secondary py-1" onClick={() => deleteService(service._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Manage Appointments</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-b">
                  <td className="py-2">{appointment.userId?.name || '-'}</td>
                  <td>{appointment.serviceId?.name || '-'}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.status}</td>
                  <td className="space-x-2">
                    <button className="button-secondary py-1" onClick={() => updateAppointmentStatus(appointment._id, 'approved')}>
                      Approve
                    </button>
                    <button className="button-secondary py-1" onClick={() => updateAppointmentStatus(appointment._id, 'rejected')}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
