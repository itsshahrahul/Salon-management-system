import tkinter as tk
from tkinter import messagebox

from .base import BasePage


class LoginPage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)

        self.page_title('Login', 'Access your account to continue')

        card = tk.Frame(self, bg='white', bd=1, relief='solid')
        card.pack(padx=20, pady=10, fill='x')

        self.message = tk.StringVar()
        self.email = tk.StringVar()
        self.password = tk.StringVar()
        self.show_password = tk.BooleanVar(value=False)

        self.add_field(card, 'Email', self.email)
        self.add_password_field_with_toggle(card, 'Password', self.password, self.show_password)

        tk.Button(card, text='Login', bg='#2563eb', fg='white', relief='flat', padx=12, pady=8,
                  command=self.login).pack(fill='x', padx=16, pady=(8, 10))

        tk.Button(card, text='Forgot Password?', bg='white', fg='#2563eb', relief='flat',
                  command=lambda: self.app.show_page('forgot')).pack(anchor='e', padx=14, pady=(0, 6))

        tk.Label(card, textvariable=self.message, fg='#b91c1c', bg='white').pack(anchor='w', padx=16, pady=(0, 10))

        info = tk.Label(
            card,
            text='Admin demo: admin@beardshop.com / admin123',
            bg='white',
            fg='#475569',
            font=('Segoe UI', 9)
        )
        info.pack(anchor='w', padx=16, pady=(0, 12))

    def login(self):
        ok, msg, user = self.app.db.login_user(self.email.get(), self.password.get())
        self.message.set(msg)
        if ok:
            self.clear_vars(self.email, self.password)
            self.message.set('')
            self.app.login_success(user)


class RegisterPage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        self.page_title('Register', 'Create a new customer account')

        card = tk.Frame(self, bg='white', bd=1, relief='solid')
        card.pack(padx=20, pady=10, fill='x')

        self.message = tk.StringVar()
        self.name = tk.StringVar()
        self.email = tk.StringVar()
        self.password = tk.StringVar()
        self.show_password = tk.BooleanVar(value=False)

        self.add_field(card, 'Full Name', self.name)
        self.add_field(card, 'Email', self.email)
        self.add_password_field_with_toggle(card, 'Password', self.password, self.show_password)

        tk.Button(card, text='Register', bg='#2563eb', fg='white', relief='flat', padx=12, pady=8,
                  command=self.register).pack(fill='x', padx=16, pady=(10, 10))

        tk.Label(card, textvariable=self.message, fg='#b91c1c', bg='white').pack(anchor='w', padx=16, pady=(0, 12))

    def register(self):
        ok, msg, user = self.app.db.register_user(self.name.get(), self.email.get(), self.password.get())
        self.message.set(msg)
        if ok:
            self.clear_vars(self.name, self.email, self.password)
            self.message.set('')
            self.app.login_success(user)


class ForgotPasswordPage(BasePage):
    def __init__(self, parent, app):
        super().__init__(parent, app)
        self.page_title('Forgot Password', 'Reset your customer account password')

        card = tk.Frame(self, bg='white', bd=1, relief='solid')
        card.pack(padx=20, pady=10, fill='x')

        self.message = tk.StringVar()
        self.email = tk.StringVar()
        self.new_password = tk.StringVar()
        self.confirm_password = tk.StringVar()

        self.add_field(card, 'Email', self.email)
        self.add_field(card, 'New Password', self.new_password, password=True)
        self.add_field(card, 'Confirm New Password', self.confirm_password, password=True)

        tk.Button(card, text='Reset Password', bg='#2563eb', fg='white', relief='flat', padx=12, pady=8,
                  command=self.reset_password).pack(fill='x', padx=16, pady=(10, 10))

        tk.Button(card, text='Back to Login', bg='white', fg='#2563eb', relief='flat',
                  command=lambda: self.app.show_page('login')).pack(anchor='e', padx=16, pady=(0, 6))

        tk.Label(card, textvariable=self.message, fg='#b91c1c', bg='white').pack(anchor='w', padx=16, pady=(0, 12))

    def reset_password(self):
        if self.new_password.get() != self.confirm_password.get():
            self.message.set('Passwords do not match')
            return

        ok, msg = self.app.db.reset_password(self.email.get(), self.new_password.get())
        self.message.set(msg)
        if ok:
            messagebox.showinfo('Success', 'Password reset successful. Please login.')
            self.app.show_page('login')
