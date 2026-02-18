import tkinter as tk
from tkinter import ttk, messagebox

from .base import BasePage


class HomePage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        self.page_title('The Beard Shop (Kathmandu)', 'Skip queues and book your appointment online')

        card = tk.Frame(self, bg='white', bd=1, relief='solid')
        card.pack(padx=20, pady=10, fill='x')

        tk.Label(card, text='Salon Management System', font=('Segoe UI', 11, 'bold'), bg='white', fg='#2563eb').pack(anchor='w', padx=14, pady=(12, 6))
        tk.Label(card, text='Book salon services quickly, manage appointments, and reduce booking errors.',
                 bg='white', fg='#334155').pack(anchor='w', padx=14, pady=(0, 12))

        btn_row = tk.Frame(card, bg='white')
        btn_row.pack(anchor='w', padx=14, pady=(0, 14))

        tk.Button(btn_row, text='View Services', bg='#2563eb', fg='white', relief='flat',
                  command=lambda: self.app.show_page('services')).pack(side='left', padx=(0, 8))

        if self.app.current_user and self.app.current_user['role'] == 'customer':
            tk.Button(btn_row, text='Book Appointment', bg='white', fg='#2563eb', relief='solid', bd=1,
                      command=lambda: self.app.show_page('book')).pack(side='left')


class ServicesPage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        self.page_title('Services', 'Search and filter services by category and max price')

        filter_card = tk.Frame(self, bg='white', bd=1, relief='solid')
        filter_card.pack(padx=20, pady=8, fill='x')

        self.search = tk.StringVar()
        self.category = tk.StringVar()
        self.max_price = tk.StringVar()
        self.message = tk.StringVar()

        top = tk.Frame(filter_card, bg='white')
        top.pack(fill='x', padx=10, pady=10)

        tk.Label(top, text='Search', bg='white').grid(row=0, column=0, sticky='w')
        tk.Entry(top, textvariable=self.search, width=25).grid(row=1, column=0, padx=(0, 8), pady=(2, 0))

        tk.Label(top, text='Category', bg='white').grid(row=0, column=1, sticky='w')
        self.category_combo = ttk.Combobox(top, textvariable=self.category, width=18, state='readonly')
        self.category_combo.grid(row=1, column=1, padx=(0, 8), pady=(2, 0))

        tk.Label(top, text='Max Price', bg='white').grid(row=0, column=2, sticky='w')
        tk.Entry(top, textvariable=self.max_price, width=12).grid(row=1, column=2, padx=(0, 8), pady=(2, 0))

        tk.Button(top, text='Apply Filter', bg='#2563eb', fg='white', relief='flat', command=self.refresh_data).grid(row=1, column=3)

        tk.Label(filter_card, textvariable=self.message, bg='white', fg='#b91c1c').pack(anchor='w', padx=12, pady=(0, 8))

        table_card = tk.Frame(self, bg='white', bd=1, relief='solid')
        table_card.pack(padx=20, pady=8, fill='both', expand=True)

        cols = ('id', 'name', 'category', 'price', 'duration', 'description')
        self.tree = ttk.Treeview(table_card, columns=cols, show='headings', height=14)

        for col, w in [('id', 60), ('name', 180), ('category', 120), ('price', 80), ('duration', 90), ('description', 360)]:
            self.tree.heading(col, text=col.title())
            self.tree.column(col, width=w, anchor='w')

        self.tree.pack(fill='both', expand=True, padx=8, pady=8)

        btn_row = tk.Frame(table_card, bg='white')
        btn_row.pack(fill='x', padx=8, pady=(0, 8))

        self.book_btn = tk.Button(btn_row, text='Book Selected Service', bg='#2563eb', fg='white', relief='flat', command=self.book_selected)
        self.book_btn.pack(side='left')

    def refresh_data(self):
        self.message.set('')
        categories = self.app.db.get_service_categories()
        self.category_combo['values'] = [''] + categories

        services = self.app.db.get_services(self.search.get(), self.category.get(), self.max_price.get())

        self.clear_tree(self.tree)

        for service in services:
            self.tree.insert('', 'end', values=(
                service['id'],
                service['name'],
                service['category'],
                f"NPR {service['price']:.0f}",
                f"{service['duration']} min",
                service['description']
            ))

        if self.app.current_user and self.app.current_user['role'] == 'admin':
            self.book_btn.config(state='disabled', text='Admin cannot book')
        else:
            self.book_btn.config(state='normal', text='Book Selected Service')

    def book_selected(self):
        selected = self.tree.focus()
        if not selected:
            messagebox.showerror('Error', 'Please select a service first')
            return

        service_id = self.tree.item(selected)['values'][0]
        book_page = self.app.frames['book']
        book_page.set_selected_service(service_id)
        self.app.show_page('book')


class BookPage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        self.page_title('Book Appointment', 'Select service, date and time')

        card = tk.Frame(self, bg='white', bd=1, relief='solid')
        card.pack(padx=20, pady=8, fill='x')

        self.message = tk.StringVar()
        self.service_var = tk.StringVar()
        self.date_var = tk.StringVar()
        self.time_var = tk.StringVar()

        tk.Label(card, text='Service', bg='white').grid(row=0, column=0, sticky='w', padx=12, pady=(10, 3))
        self.service_combo = ttk.Combobox(card, textvariable=self.service_var, width=45, state='readonly')
        self.service_combo.grid(row=1, column=0, padx=12, pady=(0, 8), sticky='w')

        tk.Label(card, text='Date (YYYY-MM-DD)', bg='white').grid(row=2, column=0, sticky='w', padx=12, pady=(0, 3))
        tk.Entry(card, textvariable=self.date_var, width=24).grid(row=3, column=0, padx=12, pady=(0, 8), sticky='w')

        tk.Label(card, text='Time (HH:MM)', bg='white').grid(row=4, column=0, sticky='w', padx=12, pady=(0, 3))
        tk.Entry(card, textvariable=self.time_var, width=24).grid(row=5, column=0, padx=12, pady=(0, 8), sticky='w')

        self.summary_label = tk.Label(card, text='Summary: -', bg='white', fg='#334155', justify='left')
        self.summary_label.grid(row=6, column=0, sticky='w', padx=12, pady=(2, 8))

        tk.Button(card, text='Confirm Booking', bg='#2563eb', fg='white', relief='flat', command=self.confirm_booking).grid(row=7, column=0, padx=12, pady=(4, 10), sticky='w')

        tk.Label(card, textvariable=self.message, bg='white', fg='#b91c1c').grid(row=8, column=0, sticky='w', padx=12, pady=(0, 12))

        self.service_combo.bind('<<ComboboxSelected>>', lambda _e: self.update_summary())

    def refresh_data(self):
        services = self.app.db.get_services_for_combo()
        values = []
        for s in services:
            values.append(f"{s['id']} | {s['name']} | NPR {int(s['price'])} | {s['duration']} min")
        self.service_combo['values'] = values
        self.update_summary()

    def set_selected_service(self, service_id):
        self.refresh_data()
        for item in self.service_combo['values']:
            if str(item).startswith(f'{service_id} |'):
                self.service_var.set(item)
                break
        self.update_summary()

    def update_summary(self):
        summary = f"Summary:\nService: {self.service_var.get() or '-'}\nDate: {self.date_var.get() or '-'}\nTime: {self.time_var.get() or '-'}"
        self.summary_label.config(text=summary)

    def confirm_booking(self):
        self.message.set('')

        if not self.app.current_user or self.app.current_user['role'] != 'customer':
            self.message.set('Only customers can book appointments')
            return

        service = self.service_var.get().strip()
        if not service:
            self.message.set('Please select a service')
            return

        try:
            service_id = int(service.split('|')[0].strip())
        except Exception:
            self.message.set('Invalid service selected')
            return

        ok, msg = self.app.db.book_appointment(
            self.app.current_user['id'],
            service_id,
            self.date_var.get().strip(),
            self.time_var.get().strip()
        )

        self.message.set(msg)
        if ok:
            self.service_var.set('')
            self.date_var.set('')
            self.time_var.set('')
            self.update_summary()


class CustomerDashboardPage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        self.page_title('Customer Dashboard', 'View and cancel your appointments')

        card = tk.Frame(self, bg='white', bd=1, relief='solid')
        card.pack(padx=20, pady=8, fill='both', expand=True)

        self.message = tk.StringVar()

        cols = ('id', 'service', 'date', 'time', 'status')
        self.tree = ttk.Treeview(card, columns=cols, show='headings', height=15)
        for col, w in [('id', 60), ('service', 240), ('date', 140), ('time', 120), ('status', 130)]:
            self.tree.heading(col, text=col.title())
            self.tree.column(col, width=w, anchor='w')
        self.tree.pack(fill='both', expand=True, padx=8, pady=8)

        btn_row = tk.Frame(card, bg='white')
        btn_row.pack(fill='x', padx=8, pady=(0, 8))

        tk.Button(btn_row, text='Cancel Selected Appointment', bg='#2563eb', fg='white', relief='flat', command=self.cancel_selected).pack(side='left')

        tk.Label(card, textvariable=self.message, bg='white', fg='#b91c1c').pack(anchor='w', padx=8, pady=(0, 8))

    def refresh_data(self):
        self.message.set('')
        self.clear_tree(self.tree)

        if not self.app.current_user:
            return

        appointments = self.app.db.get_customer_appointments(self.app.current_user['id'])
        for a in appointments:
            self.tree.insert('', 'end', values=(a['id'], a['service_name'], a['date'], a['time'], a['status']))

    def cancel_selected(self):
        selected = self.tree.focus()
        if not selected:
            self.message.set('Please select an appointment')
            return

        appointment_id = self.tree.item(selected)['values'][0]
        ok, msg = self.app.db.cancel_appointment(appointment_id, self.app.current_user['id'])
        self.message.set(msg)
        self.refresh_data()
