'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  description: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = async () => {
    setLoading(true);
    setError('');
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    if (maxPrice) query.set('maxPrice', maxPrice);

    try {
      const res = await fetch(`/api/services?${query.toString()}`);
      const data = (await res.json()) as { services?: Service[]; message?: string };

      if (!res.ok) {
        setServices([]);
        setError(data.message || 'Unable to load services right now.');
        return;
      }

      setServices(data.services || []);
    } catch (_error) {
      setServices([]);
      setError('Failed to fetch services. Please check server and internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const categories = [...new Set(services.map((service) => service.category))];

  return (
    <main className="container-base space-y-5">
      <div>
        <h1 className="section-title">Services</h1>
        <p className="muted mt-1">Browse available services, then filter by category or budget.</p>
      </div>

      <div className="card grid md:grid-cols-4 gap-3">
        <input
          className="input"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <input
          className="input"
          type="number"
          min="0"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <button onClick={loadServices} className="button-primary">Apply Filter</button>
      </div>

      {loading ? (
        <div className="card text-center text-gray-600">Loading services...</div>
      ) : error ? (
        <div className="card text-red-700 bg-red-50 border-red-200">{error}</div>
      ) : services.length === 0 ? (
        <div className="card text-gray-600">No services found.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service._id} className="card space-y-3 hover:shadow-md transition">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <span className="badge bg-gray-100 text-gray-700">{service.category}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Price:</strong> NPR {service.price}</p>
                <p><strong>Duration:</strong> {service.duration} min</p>
              </div>
              <Link href={`/book?serviceId=${service._id}`} className="button-primary inline-block">
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
