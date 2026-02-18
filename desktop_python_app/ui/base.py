import tkinter as tk


class BasePage(tk.Frame):
    def __init__(self, parent, app):
        super().__init__(parent, bg='#f3f4f6')
        self.app = app

    def page_title(self, title, subtitle=''):
        wrap = tk.Frame(self, bg='#f3f4f6')
        wrap.pack(fill='x', padx=20, pady=(16, 8))

        tk.Label(wrap, text=title, font=('Segoe UI', 20, 'bold'), bg='#f3f4f6', fg='#0f172a').pack(anchor='w')
        if subtitle:
            tk.Label(wrap, text=subtitle, font=('Segoe UI', 10), bg='#f3f4f6', fg='#475569').pack(anchor='w', pady=(3, 0))

    def add_field(self, parent, label, variable, password=False, padx=16, pady=(10, 3), entry_pady=(0, 0)):
        tk.Label(parent, text=label, bg='white', fg='#334155').pack(anchor='w', padx=padx, pady=pady)
        entry = tk.Entry(parent, textvariable=variable, show='*' if password else '')
        entry.pack(fill='x', padx=padx, pady=entry_pady)
        return entry

    def add_password_field_with_toggle(self, parent, label, variable, toggle_var, padx=16, pady=(10, 3)):
        tk.Label(parent, text=label, bg='white', fg='#334155').pack(anchor='w', padx=padx, pady=pady)
        row = tk.Frame(parent, bg='white')
        row.pack(fill='x', padx=padx)

        entry = tk.Entry(row, textvariable=variable, show='*')
        entry.pack(side='left', fill='x', expand=True)

        def toggle_password():
            entry.config(show='' if toggle_var.get() else '*')

        tk.Checkbutton(row, text='Show', variable=toggle_var, bg='white', command=toggle_password).pack(side='left', padx=8)
        return entry

    def clear_vars(self, *variables):
        for variable in variables:
            variable.set('')

    def clear_tree(self, tree):
        for item in tree.get_children():
            tree.delete(item)
