import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container-base space-y-6">
      <section className="card space-y-3">
        <h1 className="text-3xl font-bold">The Beard Shop (Kathmandu)</h1>
        <p className="text-gray-700">
          Skip long queues and manual booking errors. Book your salon appointment online in a few clicks.
        </p>
        <div className="flex gap-3">
          <Link href="/services" className="button-primary">View Services</Link>
          <Link href="/book" className="button-secondary">Book Appointment</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-1">Easy Booking</h2>
          <p className="text-sm text-gray-600">Customers can select service, date and time quickly.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-1">Service Management</h2>
          <p className="text-sm text-gray-600">Admin can add, edit and delete services from dashboard.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-1">Appointment Control</h2>
          <p className="text-sm text-gray-600">Admin can approve or reject bookings with one click.</p>
        </div>
      </section>
    </main>
  );
}
