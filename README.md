# Enterprise ERP Management System

A production-ready, complete Enterprise ERP (Enterprise Resource Planning) Management System built from scratch following clean architecture, modular folder structure, scalable coding guidelines, security best practices, and a responsive web UI.

---

## 🚀 Tech Stack

### Frontend
- **React.js** (v18+)
- **Vite** (Next-generation frontend tooling)
- **React Router DOM** (Client-side routing)
- **Axios** (Centralized API client with interceptors)
- **Tailwind CSS** (Utility-first styling with Dark Mode support)
- **React Hook Form** (Form validation)
- **React Toastify** (Notifications)
- **Recharts** (Visual graphs and charts)
- **Context API** (State management for active sessions)

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (Database mapping layer)
- **JWT (JSON Web Tokens)** (Authentication and session handling)
- **bcryptjs** (Password hashing)
- **express-validator** (Request payload validation)
- **helmet** (HTTP security headers configuration)
- **cors** (Cross-origin sharing settings)
- **morgan** (HTTP request logging)
- **multer** (File upload management)
- **pdfkit** (Salary slip PDF generation)
- **swagger-ui-express** & **swagger-jsdoc** (OpenAPI documentation)

---

## 📁 Project Structure

```text
Enterprise-ERP-Management-System/
├── backend/
│   ├── config/              # Database & Swagger configurations
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Protected session & RBAC filters
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express API routers
│   ├── utils/               # Password hashers, JWT signers, PDF generators, and Seeders
│   ├── validators/          # Express Validator schemas
│   ├── uploads/             # profile images storage directory
│   ├── app.js               # Express application initialization
│   ├── server.js            # Node HTTP server launcher
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── assets/          # Shared static files
│   │   ├── components/      # Reusable UI elements (Modal, Tables, Loader)
│   │   ├── context/         # AuthContext session states
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layout grids
│   │   ├── pages/           # Core page views (Dashboard)
│   │   ├── routes/          # Navigation guards (ProtectedRoute, RoleRoute)
│   │   ├── services/        # Axios API clients
│   │   ├── utils/           # Utility helpers
│   │   ├── App.jsx          # Root React container
│   │   ├── index.css        # Tailwind integrations
│   │   └── main.jsx         # Render mount point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── nginx.conf           # Custom production router routing configurations
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Production containers config
└── README.md
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory based on the template below:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/enterprise_erp
JWT_SECRET=your_super_secret_production_key_here
NODE_ENV=development
```

---

## 🛠️ Installation & Setup (Local running)

### Prerequisites
- Node.js (v18+)
- MongoDB Community Server running locally

### Step 1: Clone and Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environmental parameters:
   Create a `.env` file and verify your `MONGODB_URI`.
4. (Optional) Seed the database with a default Admin account (`admin@erp.com` / `adminpassword`):
   ```bash
   npm run seed
   ```
5. Start the backend developer server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

### Step 2: Set Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The React Vite application will open at `http://localhost:3000`.

---

## 🐳 Running with Docker Compose

Running the entire system (MongoDB, Node API, Nginx frontend) with Docker Compose is straightforward:

1. Navigate to the root directory containing `docker-compose.yml`.
2. Build and launch the containers:
   ```bash
   docker-compose up --build
   ```
3. Access points:
   - **Frontend Interface**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`
   - **Interactive API Docs (Swagger)**: `http://localhost:5000/api-docs`

*The MongoDB database container is configured with local volume mounts (`mongo-data`), protecting data across container restarts.*

---

## 📖 REST API Endpoints Map

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/auth/login` | Verifies user credentials and returns JWT | None |
| | `POST` | `/api/auth/logout` | Statelessly clears active token session context | Protect |
| | `GET` | `/api/auth/profile` | Retrieves profile details of the active logged-in user | Protect |
| | `PUT` | `/api/auth/change-password` | Modifies active logged-in user's passwords | Protect |
| **Employees** | `POST` | `/api/employees` | Creates a new user credential and matching Employee profile | Protect + Admin |
| | `GET` | `/api/employees` | Lists paginated employees with search and filters | Protect + Admin/Manager |
| | `GET` | `/api/employees/:id` | Fetches specific employee profile details | Protect + Allowed |
| | `PUT` | `/api/employees/:id` | Modifies parameters of a specific employee profile | Protect + Allowed |
| | `DELETE` | `/api/employees/:id` | Cascade-deletes specific employee profile and user credentials | Protect + Admin |
| **Departments** | `POST` | `/api/departments` | Creates a new department and assigns manager | Protect + Admin |
| | `GET` | `/api/departments` | Lists all departments populated with headcount statistics | Protect |
| | `GET` | `/api/departments/stats` | Computes headcount and overall payroll budgets | Protect + Admin/Manager |
| | `PUT` | `/api/departments/:id` | Modifies a specific department's parameters | Protect + Admin |
| | `DELETE` | `/api/departments/:id` | Removes a department and nullifies linked employee values | Protect + Admin |
| **Attendance** | `POST` | `/api/attendance/checkin` | Records check-in (flags Late status post 09:30 AM) | Protect |
| | `POST` | `/api/attendance/checkout` | Records check-out and computes daily duration | Protect |
| | `GET` | `/api/attendance` | Fetches attendance logs list (scoped by roles permissions) | Protect |
| **Leaves** | `POST` | `/api/leaves` | Submits a new leave request (checks annual quotas) | Protect |
| | `GET` | `/api/leaves` | Lists leaves history (scoped by roles permissions) | Protect |
| | `GET` | `/api/leaves/balance` | Returns remaining annual leave balances breakdown | Protect |
| | `PUT` | `/api/leaves/:id/cancel` | Cancels a pending leave request | Protect |
| | `PUT` | `/api/leaves/:id/approve` | Approves a leave request | Protect + Admin/Manager |
| | `PUT` | `/api/leaves/:id/reject` | Rejects a leave request | Protect + Admin/Manager |
| **Payroll** | `POST` | `/api/payroll/generate` | Generates monthly payroll record for an employee | Protect + Admin |
| | `GET` | `/api/payroll` | Lists payroll logs (scoped by roles permissions) | Protect |
| | `GET` | `/api/payroll/:id/download` | Streams a styled, corporate PDF salary slip download | Protect + Allowed |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Aggregates stats, Recharts graph values, and clocks | Protect |

---

## 🔒 Security & Best Practices
- **Password Hashing**: Synchronized hooks in User schemas automatically hash password strings using `bcrypt` on insertion.
- **RBAC**: Protects paths using authorization middleware mapping user roles (`Admin`, `Manager`, `Employee`).
- **HTTP Protection Headers**: Uses `helmet` configurations to block basic exploit vectors.
- **Cascading Triggers**:
  - Deleting an Employee profile cascade-deletes the corresponding User credentials.
  - Deleting a Department sets the `department_id` parameter to `null` for all linked employees.
