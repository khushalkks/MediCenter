# 🏥 MediCenter — Premium Doctor Booking & AI Medical Assistant Platform

MediCenter is a modern, full-stack healthcare platform designed to streamline doctor appointment booking, patient management, and provide instant AI-driven medical guidance. It features a complete patient portal, an interactive doctor panel, a comprehensive admin dashboard, and an integrated AI Medical Chatbot powered by OpenRouter.

---

## ✨ Features at a Glance

### 👤 Patient Portal (Frontend)
- **Smart Doctor Search**: Filter doctors dynamically by speciality (General Physician, Gynecologist, Neurologist, Pediatrician, Dermatologist, Gastroenterologist).
- **Interactive Booking System**: Real-time slot selection with automatic calendar updates and slot booking validation.
- **Comprehensive Profile Management**: Edit personal details, upload profile pictures (Cloudinary), and track appointment statuses.
- **Secure Payment Integration**: Seamlessly pay booking fees using **Stripe** or **Razorpay** checkout.
- **AI Medical Assistant**: Interactive chatbot that answers health queries, suggests specialties based on symptoms, and guides users on bookings.

### 💼 Admin & Doctor Dashboard
- **Analytics Overview**: View metrics (total doctors, bookings, patients, and revenue) in a responsive visual interface.
- **Doctor Management**: Easily add doctors with credentials, qualifications, specialities, fees, addresses, and bios. Toggle availability status.
- **Appointment Management**: View all appointments, mark appointments as completed, or process cancellations.
- **Doctor Specific Portal**: Individual doctor logins to manage bookings, track earnings, and update personal availability.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, React Icons, Axios, React Router v6, React Toastify |
| **Backend** | Node.js, Express.js, JWT, bcrypt (Security), Multer (File Uploads) |
| **Database** | MongoDB + Mongoose |
| **Cloud Storage** | Cloudinary (Doctor/User Profile Pictures) |
| **Payments** | Stripe & Razorpay |
| **AI Chatbot** | OpenAI SDK + OpenRouter |

---

## 🚀 Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/khushalkks/MediCenter.git
cd MediCenter
```

### 2️⃣ Configure Environment Variables
Create a `.env` file in each of the three directories based on the provided `.env.example` templates.

#### 📁 `backend/.env`
```env
PORT=4000
MONGODB_URI="your_mongodb_connection_string"
DB_NAME="wellora"
JWT_SECRET="your_custom_jwt_secret"
ADMIN_EMAIL="admin@wellora.com"
ADMIN_PASSWORD="admin_secure_password"
CLOUDINARY_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_SECRET_KEY="your_cloudinary_secret_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
CURRENCY="INR"
OPENAI_API_KEY="your_openrouter_api_key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

#### 📁 `frontend/.env`
```env
VITE_BACKEND_URL="http://localhost:4000"
VITE_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

#### 📁 `admin/.env`
```env
VITE_BACKEND_URL="http://localhost:4000"
VITE_CURRENCY="INR"
```

---

## 🗄️ Database Seeding

To get started quickly, you can seed the database with **15 sample doctors** including images, qualifications, specialities, fees, and addresses.

```bash
cd backend
node seed.js
```
*All seeded doctors will have the default login password:* `Doctor@123`

---

## 💻 Running the Project

MediCenter is configured with root scripts to let you install and run all services concurrently in development mode.

```bash
# 1. Install all dependencies across backend, frontend, and admin panels
npm run install:all

# 2. Start all three services together
npm run dev
```

### 🔗 Local Services Ports:
- **Frontend (Patient Portal)**: `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5174` (or next free port)
- **Backend API Server**: `http://localhost:4000`

---

## 📦 Production Deployment

To build the project for deployment:

#### Frontend:
```bash
cd frontend
npm run build
```

#### Admin Dashboard:
```bash
cd admin
npm run build
```

---

## 👨‍💻 Contributor

- **Khushal Kumar Sahu**


---

*Made with 💖 by Khushal 


