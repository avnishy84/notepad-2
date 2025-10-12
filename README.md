# Notepad App

A simple, lightweight web-based notepad application that lets you create, edit, and save notes directly in your browser.  
Perfect for quick note-taking, accessible from any device.

---

## 🚀 Features
- Create, edit, and delete notes
- **Read Only Mode** - View and read saved documents without editing
- Automatically saves notes to cloud storage when logged in
- Works offline with local storage
- User authentication with email/password and Google Sign-In
- Lightweight and fast
- Accessible on desktop and mobile
- Rich text formatting with toolbar
- Dark mode support
- Built-in Snake game for breaks

---

## 🌐 Live Demo
[Click here to open the app](https://notepad-2-e34b1.web.app/index.html)
---

## 📂 Project Structure
notepad-2/
│
├── public/
│   ├── index.html # Main editor interface
│   ├── readonly.html # Read-only document viewer
│   ├── about.html # About page
│   ├── settings.html # Settings page
│   ├── css/ # Stylesheets
│   └── js/
│       ├── app/ # Main application logic
│       ├── components/ # Modular components
│       └── firebase/ # Firebase configuration
├── firestore.rules # Database security rules
├── firebase.json # Firebase configuration
└── README.md # Project documentation
---

## 🛠 How to Use
1. Open the [Live Demo link](https://notepad-2-e34b1.web.app/index.html).
2. **Sign up or log in** to save your notes to the cloud.
3. Start typing your notes in the editor with rich text formatting.
4. Notes are automatically saved to your account.
5. Use the **Read Only mode** (👁️ icon) to view saved documents without editing.
6. Access your notes from any device when logged in.

---

## ⚡ Local Development
If you want to run it locally:
```bash
# Clone the repository
git clone https://github.com/avnishy84/notepad-2.git

# Open the folder
cd notepad-2

# Run locally (choose one):
firebase serve                    # Using Firebase CLI
python -m http.server 8000       # Using Python (from public/ folder)
# Then open http://localhost:8000 in your browser

📜 License

This project is licensed under the MIT License — free to use, modify, and share.

🤝 Contributing

Pull requests are welcome!
If you'd like to improve the app, just fork the repo and submit a PR.

👨‍💻 Author

Avnish Yadav
GitHub Profile


