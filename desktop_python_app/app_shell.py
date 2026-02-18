import tkinter as tk
from tkinter import messagebox

from db import DatabaseManager
from ui import (
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    HomePage,
    ServicesPage,
    BookPage,
    CustomerDashboardPage,
    AdminDashboardPage,
)


class SalonDesktopApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('The Beard Shop - Desktop Salon Management')
        self.geometry('1200x760')
        self.minsize(1000, 650)

        self.db = DatabaseManager()
        self.current_user = None

        self.configure(bg='#f3f4f6')

        self.nav_frame = tk.Frame(self, bg='white', bd=1, relief='solid')
        self.nav_frame.pack(fill='x')

        self.content = tk.Frame(self, bg='#f3f4f6')
        self.content.pack(fill='both', expand=True)

        self.frames = {
            'login': LoginPage(self.content, self),
            'register': RegisterPage(self.content, self),
            'forgot': ForgotPasswordPage(self.content, self),
            'home': HomePage(self.content, self),
            'services': ServicesPage(self.content, self),
            'book': BookPage(self.content, self),
            'dashboard': CustomerDashboardPage(self.content, self),
            'admin': AdminDashboardPage(self.content, self),
        }

        for frame in self.frames.values():
            frame.place(relx=0, rely=0, relwidth=1, relheight=1)

        self.update_nav()
        self.show_page('login')

    def update_nav(self):
        for w in self.nav_frame.winfo_children():
            w.destroy()

        tk.Label(
            self.nav_frame,
            text='The Beard Shop',
            font=('Segoe UI', 15, 'bold'),
            bg='white',
            fg='#0f172a'
        ).pack(side='left', padx=16, pady=12)

        btns = tk.Frame(self.nav_frame, bg='white')
        btns.pack(side='right', padx=8)

        if not self.current_user:
            self.nav_button(btns, 'Login', lambda: self.show_page('login'))
            self.nav_button(btns, 'Register', lambda: self.show_page('register'))
            return

        self.nav_button(btns, 'Home', lambda: self.show_page('home'))
        self.nav_button(btns, 'Services', lambda: self.show_page('services'))

        if self.current_user['role'] == 'customer':
            self.nav_button(btns, 'Book', lambda: self.show_page('book'))
            self.nav_button(btns, 'Dashboard', lambda: self.show_page('dashboard'))

        if self.current_user['role'] == 'admin':
            self.nav_button(btns, 'Admin', lambda: self.show_page('admin'))

        self.nav_button(btns, 'Logout', self.logout)

    def nav_button(self, parent, text, command):
        tk.Button(
            parent,
            text=text,
            command=command,
            bg='#2563eb',
            fg='white',
            relief='flat',
            padx=10,
            pady=4,
            cursor='hand2'
        ).pack(side='left', padx=4, pady=10)

    def show_page(self, page_name):
        if page_name in ('book', 'dashboard'):
            if not self.current_user or self.current_user['role'] != 'customer':
                messagebox.showerror('Unauthorized', 'Please login as customer.')
                page_name = 'login'

        if page_name == 'admin':
            if not self.current_user or self.current_user['role'] != 'admin':
                messagebox.showerror('Unauthorized', 'Please login as admin.')
                page_name = 'login'

        frame = self.frames[page_name]
        if hasattr(frame, 'refresh_data'):
            frame.refresh_data()
        frame.tkraise()

    def login_success(self, user):
        self.current_user = user
        self.update_nav()
        if user['role'] == 'admin':
            self.show_page('admin')
        else:
            self.show_page('home')

    def logout(self):
        self.current_user = None
        self.update_nav()
        self.show_page('login')
