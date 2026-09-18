# Riyaa Bridal Makeover — MERN Stack PBL Project

A full-stack Web Application for Bridal Makeover & Beauty Parlor Appointment Management with Client History Tracking. Built for College Project-Based Learning (PBL).

---

## 1. Project Architecture & Technologies Used

The project follows a decoupled, modular MERN architecture:

```
┌────────────────────────────────────────────────────────┐
│               Client (React + Vite SPA)                │
│  - React Router DOM v6                                 │
│  - Context API (AuthContext)                           │
│  - Axios HTTP Service Layer                            │
│  - Preserved Blush/Rose Palette & Responsive Vanilla CSS│
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs (HTTP / JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Backend (Node.js + Express REST)            │
│  - Express.js Router & Middleware                      │
│  - JWT Bearer Authentication                           │
│  - Bcrypt.js Password Hashing                          │
│  - Centralized Error Handling & Role Guards            │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│             Database (MongoDB / Mongoose)              │
│  - Users Collection (Customers & Beautician Admins)    │
│  - Appointments Collection (Indexed by Phone/Date/Status)│
│  - Services Catalog Collection                         │
└────────────────────────────────────────────────────────┘
```

### Technology Stack:
- **Frontend**: React.js 18, Vite, React Router DOM v6, Axios, Lucide React icons, Vanilla CSS.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Dotenv, CORS.
- **Database**: MongoDB with Mongoose ODM (supports MongoDB Atlas, local MongoDB, or zero-config in-memory fallback).
- **Security**: Salted password hashing, JWT expiration, role-based access control (`CUSTOMER` vs `ADMIN`).

---

## 2. Directory Structure

```
d:\riyaParlor(PPL)\Riyaa-bridal-website--PBL-\
├── client/                     # React + Vite Frontend
│   ├── public/
│   │   └── images/             # Hero & makeover assets
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ServiceModal, StatusBadge, ProtectedRoute
│   │   ├── context/            # AuthContext (login, register, logout, persistent session)
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page with hero & popular treatments
│   │   │   ├── About.jsx       # Studio story and hygiene standards
│   │   │   ├── Services.jsx    # Filterable catalog (Hair, Skin, Bridal, Nails)
│   │   │   ├── BookAppointment.jsx # Booking wizard with slot validation & contact
│   │   │   ├── MyAppointments.jsx  # Customer appointment portal & tracking
│   │   │   ├── Login.jsx       # Authenticated sign in with quick demo buttons
│   │   │   ├── Register.jsx    # Customer registration
│   │   │   └── AdminDashboard.jsx  # Beautician management & customer history
│   │   ├── services/           # api.js, authService, appointmentService, adminService
│   │   ├── App.jsx             # React route tree
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Preserved design tokens, typography, and styling
│   ├── index.html              # Vite HTML template
│   ├── vite.config.js          # Vite config with backend proxy on /api
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB / Mongoose connection & initial data seeding
│   ├── controllers/
│   │   ├── authController.js   # register, login, getMe
│   │   ├── appointmentController.js # create, getMyAppointments, getById, cancel
│   │   ├── adminController.js  # getAllAppointments, stats, updateStatus, getCustomerHistory
│   │   └── serviceController.js# getAllServices, getServiceById
│   ├── middleware/
│   │   ├── auth.js             # JWT bearer verification
│   │   ├── roleCheck.js        # Admin / Beautician permission guard
│   │   └── errorHandler.js     # Standardized JSON error response
│   ├── models/
│   │   ├── User.js             # Customer & Admin model with bcrypt hooks
│   │   ├── Service.js          # Service catalog model
│   │   └── Appointment.js      # Appointment model with compound indexes
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth/*
│   │   ├── appointmentRoutes.js# /api/appointments/*
│   │   ├── adminRoutes.js      # /api/admin/*
│   │   └── serviceRoutes.js    # /api/services/*
│   ├── utils/
│   │   └── generateId.js       # Appointment ID generator (e.g. APT-202609-1234)
│   ├── .env                    # Environment configuration
│   ├── .env.example
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── package.json                # Root package.json for project orchestration
└── README.md                   # This documentation
```

---

## 3. MongoDB Schemas & Data Models

### User Model (`server/models/User.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trimmed | Customer or beautician full name |
| `email` | String | Required, Unique, Lowercase, Indexed | Login email |
| `phone` | String | Required, Trimmed, Indexed | Contact phone number |
| `password` | String | Required, Min 6 chars, `select: false` | Hashed via bcrypt salt |
| `role` | String | Enum: `['CUSTOMER', 'ADMIN']` | Access level (default: `CUSTOMER`) |
| `createdAt` | Date | Timestamp | Automatic |
| `updatedAt` | Date | Timestamp | Automatic |

### Appointment Model (`server/models/Appointment.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `appointmentId` | String | Required, Unique, Indexed | Human-readable ID (e.g. `APT-202609-1001`) |
| `customer` | ObjectId | Ref: `User`, Required, Indexed | Reference to customer account |
| `customerName` | String | Required | Full name of customer |
| `customerPhone` | String | Required, Indexed | Phone number for contact & lookup |
| `customerEmail` | String | Required, Indexed | Email address for confirmation |
| `service` | ObjectId | Ref: `Service` | Optional reference to service document |
| `serviceId` | String | Required | Service code (e.g. `bridal_makeup`) |
| `serviceName` | String | Required | Service display name |
| `appointmentDate`| String | Required, Indexed | Format: `YYYY-MM-DD` |
| `appointmentTime`| String | Required | Slot (e.g. `10:00 AM - 11:30 AM`) |
| `numberOfPeople` | Number | Default: 1 | Guest count for bridal party |
| `notes` | String | Optional | Special requests / skin allergies |
| `status` | String | Enum: `['Pending', 'Confirmed', 'Completed', 'Cancelled']` | Indexed status (default: `Pending`) |
| `paymentStatus` | String | Enum: `['Pending', 'Paid', 'Partial', 'Not Required']` | Payment state |
| `createdAt` | Date | Timestamp | Booking timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### Service Model (`server/models/Service.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `serviceId` | String | Required, Unique | Unique identifier (e.g. `bridal_makeup`) |
| `name` | String | Required | Treatment name |
| `category` | String | Required | `Hair`, `Skin`, `Bridal`, `Nails` |
| `priceRange` | String | Required | Price text (e.g. `Rs. 8,000 - Rs. 20,000`) |
| `duration` | String | Required | Service duration (e.g. `150-210 mins`) |
| `description` | String | Optional | Overview of the treatment |
| `benefits` | [String] | Array | Key benefits list |
| `process` | [String] | Array | Step-by-step salon procedure |

---

## 4. REST API Endpoint Reference

### Authentication APIs (`/api/auth`)
- `POST /api/auth/register` — Register customer account. Body: `{ name, email, phone, password }`.
- `POST /api/auth/login` — Login user. Body: `{ email, password }`. Returns `{ token, user }`.
- `GET /api/auth/me` — [Private] Get current logged-in user profile.

### Customer Appointment APIs (`/api/appointments`)
- `POST /api/appointments` — Book new appointment. Validates future date and prevents duplicate slot booking.
- `GET /api/appointments/my` — [Private] Fetch all appointments for the logged-in customer.
- `GET /api/appointments/:id` — [Private] View single appointment details (owner or admin only).
- `PUT /api/appointments/:id/cancel` — [Private] Cancel an existing appointment.

### Admin & Beautician APIs (`/api/admin`) *(Requires ADMIN role)*
- `GET /api/admin/appointments` — Fetch appointments with filtering (`tab`, `status`, `service`, `date`, `search`).
- `GET /api/admin/stats` — Dashboard counters (Today, Upcoming, Pending, Completed, Cancelled, Total).
- `GET /api/admin/appointments/today` — Fast fetch for today's salon schedule.
- `GET /api/admin/appointments/upcoming` — Fetch upcoming active appointments.
- `PUT /api/admin/appointments/:id/status` — Update appointment status (`Pending`, `Confirmed`, `Completed`, `Cancelled`) and beautician notes.
- `GET /api/admin/customers/history` — Lookup customer history by query (`name`, `phone`, or `email`).

### Services Catalog APIs (`/api/services`)
- `GET /api/services` — List all services, optionally filtered by `?category=hair|skin|bridal|nails`.
- `GET /api/services/:id` — Get detailed service information.

---

## 5. Security & Authentication Flow

1. **Password Hashing**: User passwords are automatically salted and hashed using `bcryptjs` in Mongoose pre-save hooks. Passwords are never returned in JSON responses (`select: false`).
2. **JWT Tokens**: Upon successful login or registration, the backend signs a JSON Web Token containing the user's ID and role (`CUSTOMER` or `ADMIN`) with a 7-day expiration.
3. **Session Persistence**: React stores the token in `localStorage`. The Axios interceptor in `src/services/api.js` automatically attaches `Authorization: Bearer <token>` to every subsequent request.
4. **Role Authorization**:
   - Customer routes are protected by `authenticateToken`.
   - Beautician routes under `/api/admin` enforce `requireAdmin`. Attempted customer access returns `403 Forbidden`.
   - On the frontend, `<ProtectedRoute adminOnly={true}>` restricts access to `/admin`.

---

## 6. How to Run the Application

### Prerequisites:
- Node.js (v18 or higher recommended; v24 is fully supported)
- npm (v9 or higher)

### Step 1: Install Dependencies
From the root directory:
```bash
npm run install:all
```
*Or manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### Step 2: Configure Environment Variables
A default `.env` is already configured in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/riyaa_makeover
JWT_SECRET=riyaa_bridal_makeover_secret_jwt_2026_pbl_college
NODE_ENV=development
```
> **Note on MongoDB**: If you have a local MongoDB daemon or MongoDB Atlas URI, set `MONGODB_URI` accordingly. If no live instance is detected, the server automatically starts an embedded in-memory MongoDB so the application runs without manual setup.

### Step 3: Run the Application
You can run both client and server:

**Option A (Separate terminals):**
- Terminal 1 (Backend):
  ```bash
  cd server
  npm start
  ```
  *Server starts on `http://localhost:5000`.*

- Terminal 2 (Frontend):
  ```bash
  cd client
  npm run dev
  ```
  *Client starts on `http://localhost:5173`.*

---

## 7. Demo & Testing Accounts

The database is automatically pre-seeded with default demo accounts:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Beautician / Admin** | `admin@riyaa.com` | `admin123` | Full Beautician Dashboard (`/admin`), Status Changer, Customer History |
| **Sample Customer** | `priya@example.com` | `priya123` | Customer Portal (`/my-appointments`), Bookings |

---

## 8. Migration & Legacy Files Notice

The original static files (`index.html`, `services.html`, `about.html`, `contact.html`, `styles.css`) have been fully transformed into React components in `client/src/`. All aesthetic tokens, fonts ("Playfair Display", "Poppins"), color schemes, and hero images have been preserved 100%.
