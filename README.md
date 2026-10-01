# 📚 Library Management System

A web-based Library Management System designed to manage books, readers/students, book issuing, and borrowing records efficiently.

## 🎯 Project Overview

The Library Management System provides separate functionality for librarians and students.

Librarians can manage books and readers, issue books, and view borrowing records.

Students can log in and access their library-related information through the student dashboard.

## ✨ Features

### 👨‍💼 Librarian Features

* Librarian login
* View all books
* Add new books
* View readers
* Add new readers
* Issue books
* View borrowing records
* Logout

### 🎓 Student Features

* Student login
* Student dashboard
* View available library information
* Access student-related library features

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Cloud Database

* Aiven MySQL

## 📂 Project Structure

```text
library-management-system/
│
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── books.html
│   ├── add-book.html
│   ├── readers.html
│   ├── add-reader.html
│   ├── issue-book.html
│   ├── borrowings.html
│   ├── student-login.html
│   ├── student-dashboard.html
│   ├── style.css
│   ├── student.css
│   ├── script.js
│   └── student.js
│
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Before running the project, make sure you have the following installed:

* Node.js
* npm
* MySQL / Aiven MySQL database
* Git

## 🚀 How to Run the Project

Follow these steps to run the Library Management System on your computer.

### 1. Clone the Repository

Open PowerShell or Command Prompt and run:

```bash
git clone https://github.com/gawademrudula2405-ui/library-management-system.git
```

Then enter the project folder:

```bash
cd library-management-system
```

### 2. Open the Backend Folder

Run:

```bash
cd backend
```

### 3. Install Backend Dependencies

Run:

```bash
npm install
```

This will install all the required Node.js packages listed in `package.json`.

### 4. Configure the Database

Create a `.env` file inside the `backend` folder.

Add your MySQL/Aiven database credentials:

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=your_database_port
```

> ⚠️ Do not upload your `.env` file to GitHub because it contains private database credentials.

### 5. Start the Backend Server

While inside the `backend` folder, run:

```bash
node server.js
```

If everything is configured correctly, you should see:

```text
Server is running on port 5000
```

### 6. Open the Application

Open your web browser and go to:

```text
http://localhost:5000
```

The Library Management System should now open in your browser.

## 🔐 Login

The system provides separate login functionality for:

* Librarian
* Student

Use the login credentials configured for your local project.

> For security reasons, actual passwords and database credentials are not included in this repository.

## 🗄️ Database

The project uses MySQL as its database.

The database is hosted using Aiven MySQL.

The backend connects to the database using the credentials stored in the `.env` file.

## 🔒 Security

Sensitive database credentials are stored in the `.env` file and are excluded from GitHub using `.gitignore`.

The `.env` file should never be committed or shared publicly.

## 📌 Future Improvements

* Improved UI/UX
* Book search and filtering
* Book return functionality
* Fine calculation
* Email notifications
* Advanced student profile management
* Improved dashboard analytics
* Responsive design for mobile devices

## 👩‍💻 Author

**Mrudula Gawade**

## 📄 License

This project is developed for educational and academic purposes.
