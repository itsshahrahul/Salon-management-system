# The Beard Shop - Salon Management System

Simple student-level salon management system built with Next.js (App Router), JavaScript, Tailwind CSS, and MongoDB.

## Features

### Customer
- Register and login
- View services
- Search/filter services (category + max price)
- Book appointment
- View appointments
- Cancel appointment

### Admin
- Login (demo admin)
- Dashboard stats (total services, pending, approved bookings)
- Manage services (add/edit/delete)
- Manage appointments (approve/reject)

## Project Structure

- `app` (pages + API routes)
- `models` (Mongoose schemas)
- `lib` (MongoDB connection)
- `api` (placeholder folder requested in specification)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from example:
   ```bash
   cp .env.local.example .env.local
   ```
   Then set your MongoDB URI.

3. Run app:
   ```bash
   npm run dev
   ```

4. Open:
   - http://localhost:3000

## One-File Launch (for demo)

If you want to run the whole project from one file:

1. Make sure Python and Node.js are installed.
2. Run:
   ```bash
   python main.py
   ```

What it does:
- installs dependencies automatically if needed,
- starts the Next.js development server,
- opens the app in your browser automatically.

Stop the app with `Ctrl + C`.

## Admin Demo Login

- Email: `admin@beardshop.com`
- Password: `admin123`

The first admin login auto-creates an admin user in DB.
