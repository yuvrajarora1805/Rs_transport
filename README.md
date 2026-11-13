# 🚛 RS Transport ERP – Running Guide (MySQL / XAMPP)

Centralised Transport ERP, Freight Settlement & Petrol Pump Accounting System.

---

## ⚡ Quick Start with XAMPP (MySQL)

### Step 1: Start MySQL in XAMPP
Open your **XAMPP Control Panel** and click **Start** next to **MySQL** (default port `3306`).

*(The backend will automatically create the `rs_transport_db` database and initialize all tables & default seeds on first startup, or you can import `backend/sql/schema_mysql.sql` in phpMyAdmin).*

---

### Step 2: Start the Backend API (Port 4000)

Open a terminal:

```bash
cd backend
npm run start:dev
```

* **API Server:** `http://localhost:4000`
* Default Admin User: `admin` / Password: `admin123`
* Uses native `mysql2` connection pooling.

---

### Step 3: Start the Frontend UI (Port 3000)

Open a second terminal:

```bash
cd frontend
npm run dev
```

* **Web UI:** `http://localhost:3000`
* Auto-redirects to the Transport Management Dashboard.
