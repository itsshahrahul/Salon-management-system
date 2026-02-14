import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container-base space-y-8">
      <section className="card space-y-4 bg-gradient-to-br from-white to-gray-100">
        <p className="badge bg-blue-600 text-white">Salon Management System</p>
        <h1 className="section-title">The Beard Shop (Kathmandu)</h1>
        <p className="text-gray-700 max-w-2xl">
          Skip long queues and manual booking errors. Book your salon appointment online in a few clicks.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/services" className="button-primary">View Services</Link>
          <Link href="/book" className="button-secondary">Book Appointment</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-1">Easy Booking</h2>
          <p className="muted">Customers can select service, date and time quickly.</p>
        </div>
        <div className="card hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-1">Service Management</h2>
          <p className="muted">Admin can add, edit and delete services from dashboard.</p>
        </div>
        <div className="card hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-1">Appointment Control</h2>
          <p className="muted">Admin can approve or reject bookings with one click.</p>
        </div>
      </section>
    </main>
  );
}
