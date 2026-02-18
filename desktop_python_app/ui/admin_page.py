import tkinter as tk
from tkinter import ttk

from .base import BasePage


class AdminDashboardPage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        self.page_title('Admin Dashboard', 'Manage services and appointments')

        self.message = tk.StringVar()

        stats_card = tk.Frame(self, bg='white', bd=1, relief='solid')
        stats_card.pack(padx=20, pady=8, fill='x')

        self.total_label = tk.Label(stats_card, text='Total Services: 0', bg='white', fg='#0f172a', font=('Segoe UI', 11, 'bold'))
        self.total_label.pack(side='left', padx=14, pady=12)

        self.pending_label = tk.Label(stats_card, text='Pending: 0', bg='white', fg='#0f172a', font=('Segoe UI', 11, 'bold'))
        self.pending_label.pack(side='left', padx=14, pady=12)

        self.approved_label = tk.Label(stats_card, text='Approved: 0', bg='white', fg='#0f172a', font=('Segoe UI', 11, 'bold'))
        self.approved_label.pack(side='left', padx=14, pady=12)

        body = tk.Frame(self, bg='#f3f4f6')
        body.pack(fill='both', expand=True, padx=20, pady=8)

        left = tk.Frame(body, bg='white', bd=1, relief='solid')
        left.pack(side='left', fill='both', expand=True, padx=(0, 6))

        right = tk.Frame(body, bg='white', bd=1, relief='solid')
        right.pack(side='left', fill='both', expand=True, padx=(6, 0))

        tk.Label(left, text='Manage Services', bg='white', fg='#0f172a', font=('Segoe UI', 12, 'bold')).pack(anchor='w', padx=10, pady=(8, 4))

        form = tk.Frame(left, bg='white')
        form.pack(fill='x', padx=10)

        self.edit_service_id = None
        self.s_name = tk.StringVar()
        self.s_price = tk.StringVar()
        self.s_duration = tk.StringVar()
        self.s_category = tk.StringVar()
        self.s_description = tk.StringVar()

        self._service_field(form, 'Name', self.s_name, 0)
        self._service_field(form, 'Price', self.s_price, 1)
        self._service_field(form, 'Duration (min)', self.s_duration, 2)
        self._service_field(form, 'Category', self.s_category, 3)
        self._service_field(form, 'Description', self.s_description, 4)

        btns = tk.Frame(left, bg='white')
        btns.pack(fill='x', padx=10, pady=6)

        tk.Button(btns, text='Add / Update', bg='#2563eb', fg='white', relief='flat', command=self.save_service).pack(side='left', padx=(0, 6))
        tk.Button(btns, text='Clear', bg='white', fg='#2563eb', relief='solid', bd=1, command=self.clear_service_form).pack(side='left')

        cols = ('id', 'name', 'category', 'price', 'duration')
        self.services_tree = ttk.Treeview(left, columns=cols, show='headings', height=10)
        for col, w in [('id', 50), ('name', 150), ('category', 100), ('price', 80), ('duration', 90)]:
            self.services_tree.heading(col, text=col.title())
            self.services_tree.column(col, width=w, anchor='w')
        self.services_tree.pack(fill='both', expand=True, padx=10, pady=8)

        svc_btns = tk.Frame(left, bg='white')
        svc_btns.pack(fill='x', padx=10, pady=(0, 8))
        tk.Button(svc_btns, text='Edit Selected', bg='white', fg='#2563eb', relief='solid', bd=1, command=self.edit_selected_service).pack(side='left', padx=(0, 6))
        tk.Button(svc_btns, text='Delete Selected', bg='#dc2626', fg='white', relief='flat', command=self.delete_selected_service).pack(side='left')

        tk.Label(right, text='Manage Appointments', bg='white', fg='#0f172a', font=('Segoe UI', 12, 'bold')).pack(anchor='w', padx=10, pady=(8, 4))

        app_cols = ('id', 'customer', 'service', 'date', 'time', 'status')
        self.appointments_tree = ttk.Treeview(right, columns=app_cols, show='headings', height=16)
        for col, w in [('id', 50), ('customer', 130), ('service', 150), ('date', 110), ('time', 90), ('status', 100)]:
            self.appointments_tree.heading(col, text=col.title())
            self.appointments_tree.column(col, width=w, anchor='w')
        self.appointments_tree.pack(fill='both', expand=True, padx=10, pady=8)

        app_btns = tk.Frame(right, bg='white')
        app_btns.pack(fill='x', padx=10, pady=(0, 8))
        tk.Button(app_btns, text='Approve', bg='#16a34a', fg='white', relief='flat', command=lambda: self.update_selected_appointment('approved')).pack(side='left', padx=(0, 6))
        tk.Button(app_btns, text='Reject', bg='#dc2626', fg='white', relief='flat', command=lambda: self.update_selected_appointment('rejected')).pack(side='left')

        tk.Label(self, textvariable=self.message, bg='#f3f4f6', fg='#b91c1c').pack(anchor='w', padx=20, pady=(0, 8))

    def _service_field(self, parent, label, variable, row):
        tk.Label(parent, text=label, bg='white').grid(row=row, column=0, sticky='w', pady=(4, 2))
        tk.Entry(parent, textvariable=variable).grid(row=row, column=1, sticky='ew', padx=(8, 0), pady=(4, 2))
        parent.grid_columnconfigure(1, weight=1)

    def clear_service_form(self):
        self.edit_service_id = None
        self.clear_vars(self.s_name, self.s_price, self.s_duration, self.s_category, self.s_description)

    def save_service(self):
        admin_id = self.app.current_user['id']
        if self.edit_service_id:
            ok, msg = self.app.db.update_service(
                self.edit_service_id,
                self.s_name.get(),
                self.s_price.get(),
                self.s_duration.get(),
                self.s_category.get(),
                self.s_description.get(),
                admin_id
            )
        else:
            ok, msg = self.app.db.add_service(
                self.s_name.get(),
                self.s_price.get(),
                self.s_duration.get(),
                self.s_category.get(),
                self.s_description.get(),
                admin_id
            )

        self.message.set(msg)
        if ok:
            self.clear_service_form()
            self.refresh_data()

    def edit_selected_service(self):
        selected = self.services_tree.focus()
        if not selected:
            self.message.set('Please select a service')
            return

        values = self.services_tree.item(selected)['values']
        service_id = values[0]

        cursor = self.app.db.conn.cursor()
        cursor.execute('SELECT * FROM services WHERE id = ?', (service_id,))
        row = cursor.fetchone()
        if not row:
            self.message.set('Service not found')
            return

        self.edit_service_id = row['id']
        self.s_name.set(row['name'])
        self.s_price.set(str(row['price']))
        self.s_duration.set(str(row['duration']))
        self.s_category.set(row['category'])
        self.s_description.set(row['description'])

    def delete_selected_service(self):
        selected = self.services_tree.focus()
        if not selected:
            self.message.set('Please select a service')
            return

        service_id = self.services_tree.item(selected)['values'][0]
        ok, msg = self.app.db.delete_service(service_id, self.app.current_user['id'])
        self.message.set(msg)
        if ok:
            self.refresh_data()

    def update_selected_appointment(self, status):
        selected = self.appointments_tree.focus()
        if not selected:
            self.message.set('Please select an appointment')
            return

        appointment_id = self.appointments_tree.item(selected)['values'][0]
        ok, msg = self.app.db.update_appointment_status(appointment_id, status, self.app.current_user['id'])
        self.message.set(msg)
        if ok:
            self.refresh_data()

    def refresh_data(self):
        self.message.set('')

        stats = self.app.db.get_admin_stats(self.app.current_user['id'])
        if stats:
            self.total_label.config(text=f"Total Services: {stats['total_services']}")
            self.pending_label.config(text=f"Pending: {stats['pending_bookings']}")
            self.approved_label.config(text=f"Approved: {stats['approved_bookings']}")

        self.clear_tree(self.services_tree)

        services = self.app.db.get_services()
        for s in services:
            self.services_tree.insert('', 'end', values=(s['id'], s['name'], s['category'], int(s['price']), f"{s['duration']} min"))

        self.clear_tree(self.appointments_tree)

        appointments = self.app.db.get_all_appointments(self.app.current_user['id'])
        for a in appointments:
            self.appointments_tree.insert('', 'end', values=(
                a['id'],
                a['customer_name'],
                a['service_name'],
                a['date'],
                a['time'],
                a['status']
            ))
