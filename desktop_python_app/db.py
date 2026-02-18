import hashlib
import sqlite3
from datetime import datetime


class DatabaseManager:
    def __init__(self, db_name='salon_desktop.db'):
        self.conn = sqlite3.connect(db_name)
        self.conn.row_factory = sqlite3.Row
        self.create_tables()
        self.seed_data()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('customer', 'admin'))
            )
            '''
        )

        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                duration INTEGER NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL
            )
            '''
        )

        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                service_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(service_id) REFERENCES services(id)
            )
            '''
        )
        self.conn.commit()

    def seed_data(self):
        cursor = self.conn.cursor()

        cursor.execute('SELECT id FROM users WHERE email = ?', ('admin@beardshop.com',))
        if cursor.fetchone() is None:
            cursor.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ('Admin', 'admin@beardshop.com', self.hash_password('admin123'), 'admin')
            )

        cursor.execute('SELECT COUNT(*) AS total FROM services')
        total = cursor.fetchone()['total']
        if total == 0:
            sample_services = [
                ('Classic Haircut', 500, 30, 'Haircut', 'Clean and stylish haircut.'),
                ('Beard Trim', 300, 20, 'Beard', 'Professional beard shaping and trim.'),
                ('Haircut + Beard', 750, 45, 'Combo', 'Complete grooming package.'),
                ('Facial', 900, 50, 'Skincare', 'Relaxing facial treatment.'),
            ]
            cursor.executemany(
                'INSERT INTO services (name, price, duration, category, description) VALUES (?, ?, ?, ?, ?)',
                sample_services
            )

        self.conn.commit()

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()

    def register_user(self, name, email, password):
        if not name or not email or not password:
            return False, 'All fields are required', None

        cursor = self.conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email.lower(),))
        if cursor.fetchone():
            return False, 'Email already registered', None

        cursor.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            (name.strip(), email.lower().strip(), self.hash_password(password), 'customer')
        )
        self.conn.commit()

        user_id = cursor.lastrowid
        return True, 'Registration successful', {
            'id': user_id,
            'name': name.strip(),
            'email': email.lower().strip(),
            'role': 'customer'
        }

    def login_user(self, email, password):
        if not email or not password:
            return False, 'Email and password are required', None

        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email.lower().strip(),))
        user = cursor.fetchone()

        if not user:
            return False, 'Invalid credentials', None

        if user['password'] != self.hash_password(password):
            return False, 'Invalid credentials', None

        return True, 'Login successful', {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }

    def reset_password(self, email, new_password):
        if not email or not new_password:
            return False, 'Email and new password are required'

        if len(new_password) < 6:
            return False, 'Password must be at least 6 characters'

        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email.lower().strip(),))
        user = cursor.fetchone()
        if not user:
            return False, 'User not found'

        if user['role'] == 'admin':
            return False, 'Admin password is fixed in this demo app'

        cursor.execute('UPDATE users SET password = ? WHERE id = ?', (self.hash_password(new_password), user['id']))
        self.conn.commit()
        return True, 'Password reset successful'

    def get_services(self, search='', category='', max_price=''):
        query = 'SELECT * FROM services WHERE 1=1'
        params = []

        if search.strip():
            query += ' AND LOWER(name) LIKE ?'
            params.append(f"%{search.strip().lower()}%")

        if category.strip():
            query += ' AND category = ?'
            params.append(category.strip())

        if max_price.strip():
            try:
                price = float(max_price)
                query += ' AND price <= ?'
                params.append(price)
            except ValueError:
                pass

        query += ' ORDER BY id DESC'

        cursor = self.conn.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()

    def get_service_categories(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT DISTINCT category FROM services ORDER BY category ASC')
        return [row['category'] for row in cursor.fetchall()]

    def add_service(self, name, price, duration, category, description, admin_id):
        if not all([name, price, duration, category, description]):
            return False, 'All fields are required'

        if not self.is_admin(admin_id):
            return False, 'Unauthorized'

        try:
            price = float(price)
            duration = int(duration)
        except ValueError:
            return False, 'Price or duration is invalid'

        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO services (name, price, duration, category, description) VALUES (?, ?, ?, ?, ?)',
            (name.strip(), price, duration, category.strip(), description.strip())
        )
        self.conn.commit()
        return True, 'Service added'

    def update_service(self, service_id, name, price, duration, category, description, admin_id):
        if not all([name, price, duration, category, description]):
            return False, 'All fields are required'

        if not self.is_admin(admin_id):
            return False, 'Unauthorized'

        try:
            price = float(price)
            duration = int(duration)
        except ValueError:
            return False, 'Price or duration is invalid'

        cursor = self.conn.cursor()
        cursor.execute(
            '''
            UPDATE services
            SET name = ?, price = ?, duration = ?, category = ?, description = ?
            WHERE id = ?
            ''',
            (name.strip(), price, duration, category.strip(), description.strip(), service_id)
        )
        self.conn.commit()
        if cursor.rowcount == 0:
            return False, 'Service not found'
        return True, 'Service updated'

    def delete_service(self, service_id, admin_id):
        if not self.is_admin(admin_id):
            return False, 'Unauthorized'

        cursor = self.conn.cursor()
        cursor.execute('DELETE FROM services WHERE id = ?', (service_id,))
        self.conn.commit()
        if cursor.rowcount == 0:
            return False, 'Service not found'
        return True, 'Service deleted'

    def get_services_for_combo(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT id, name, price, duration FROM services ORDER BY name ASC')
        return cursor.fetchall()

    def book_appointment(self, user_id, service_id, date, time):
        if not user_id or not service_id or not date or not time:
            return False, 'All fields are required'

        cursor = self.conn.cursor()

        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'customer':
            return False, 'Invalid customer'

        cursor.execute('SELECT * FROM services WHERE id = ?', (service_id,))
        service = cursor.fetchone()
        if not service:
            return False, 'Service not found'

        cursor.execute(
            '''
            SELECT id FROM appointments
            WHERE date = ? AND time = ? AND status IN ('pending', 'approved')
            ''',
            (date, time)
        )
        if cursor.fetchone():
            return False, 'Slot not available'

        cursor.execute(
            '''
            INSERT INTO appointments (user_id, service_id, date, time, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?)
            ''',
            (user_id, service_id, date, time, datetime.now().isoformat())
        )
        self.conn.commit()
        return True, 'Appointment booked successfully'

    def get_customer_appointments(self, user_id):
        cursor = self.conn.cursor()
        cursor.execute(
            '''
            SELECT a.id, s.name AS service_name, a.date, a.time, a.status
            FROM appointments a
            JOIN services s ON s.id = a.service_id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            ''',
            (user_id,)
        )
        return cursor.fetchall()

    def cancel_appointment(self, appointment_id, user_id):
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM appointments WHERE id = ?', (appointment_id,))
        appointment = cursor.fetchone()

        if not appointment:
            return False, 'Appointment not found'

        if appointment['user_id'] != user_id:
            return False, 'Unauthorized'

        if appointment['status'] not in ('pending', 'approved'):
            return False, 'Only pending or approved appointments can be cancelled'

        cursor.execute('UPDATE appointments SET status = ? WHERE id = ?', ('cancelled', appointment_id))
        self.conn.commit()
        return True, 'Appointment cancelled'

    def get_admin_stats(self, admin_id):
        if not self.is_admin(admin_id):
            return None

        cursor = self.conn.cursor()
        cursor.execute('SELECT COUNT(*) AS total FROM services')
        total_services = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) AS total FROM appointments WHERE status = 'pending'")
        pending = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) AS total FROM appointments WHERE status = 'approved'")
        approved = cursor.fetchone()['total']

        return {
            'total_services': total_services,
            'pending_bookings': pending,
            'approved_bookings': approved
        }

    def get_all_appointments(self, admin_id):
        if not self.is_admin(admin_id):
            return []

        cursor = self.conn.cursor()
        cursor.execute(
            '''
            SELECT a.id, u.name AS customer_name, s.name AS service_name, a.date, a.time, a.status
            FROM appointments a
            JOIN users u ON u.id = a.user_id
            JOIN services s ON s.id = a.service_id
            ORDER BY a.created_at DESC
            '''
        )
        return cursor.fetchall()

    def update_appointment_status(self, appointment_id, status, admin_id):
        if status not in ('approved', 'rejected'):
            return False, 'Invalid status'

        if not self.is_admin(admin_id):
            return False, 'Unauthorized'

        cursor = self.conn.cursor()
        cursor.execute('UPDATE appointments SET status = ? WHERE id = ?', (status, appointment_id))
        self.conn.commit()

        if cursor.rowcount == 0:
            return False, 'Appointment not found'

        return True, f'Appointment {status}'

    def is_admin(self, user_id):
        cursor = self.conn.cursor()
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        return row is not None and row['role'] == 'admin'
