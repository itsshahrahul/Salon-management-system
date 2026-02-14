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

  const loadServices = async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    if (maxPrice) query.set('maxPrice', maxPrice);

    const res = await fetch(`/api/services?${query.toString()}`);
    const data = (await res.json()) as { services?: Service[] };
    setServices(data.services || []);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const categories = [...new Set(services.map((service) => service.category))];

  return (
    <main className="container-base space-y-4">
      <h1 className="text-2xl font-semibold">Services</h1>

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
        <p>Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-600">No services found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service._id} className="card space-y-2">
              <h2 className="text-lg font-semibold">{service.name}</h2>
              <p className="text-sm text-gray-600">{service.description}</p>
              <p><strong>Category:</strong> {service.category}</p>
              <p><strong>Price:</strong> NPR {service.price}</p>
              <p><strong>Duration:</strong> {service.duration} min</p>
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
