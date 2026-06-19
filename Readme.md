# StockFlow — Inventory & Order Management System

A full-stack web application for managing products, customers, and orders with automatic inventory tracking.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React 18, React Router v6, Axios
- **Infrastructure**: Docker, Docker Compose
- **Deployment**: Render (backend) + Vercel (frontend)

## Features

- Product CRUD with unique SKU enforcement
- Customer management with unique email validation
- Order creation with automatic stock deduction
- Prevents orders when stock is insufficient
- Stock is restored when an order is cancelled
- Dashboard with live stats and low-stock alerts
- Fully responsive UI (desktop + mobile)

## Running Locally with Docker Compose

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd inventory-system

# 2. Copy env file
cp .env.example .env

# 3. Start all services
docker compose up --build

# Frontend → http://localhost:3000
# Backend API → http://localhost:8000
# API docs → http://localhost:8000/docs
```

## Running Without Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set DATABASE_URL in your environment or create a .env file
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
export ALLOWED_ORIGINS=http://localhost:3000

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env          # set REACT_APP_API_URL=http://localhost:8000
npm install
npm start
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /products/ | List all products |
| POST | /products/ | Create product |
| GET | /products/{id} | Get product |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |
| GET | /customers/ | List all customers |
| POST | /customers/ | Create customer |
| GET | /customers/{id} | Get customer |
| DELETE | /customers/{id} | Delete customer |
| GET | /orders/ | List all orders |
| POST | /orders/ | Create order (deducts stock) |
| GET | /orders/{id} | Get order details |
| DELETE | /orders/{id} | Cancel order (restores stock) |
| GET | /dashboard/ | Summary stats + low stock |

Interactive docs: `http://localhost:8000/docs`

## Deployment

### Backend on Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add a **PostgreSQL** database on Render, copy the internal URL to `DATABASE_URL` env var
7. Set `ALLOWED_ORIGINS` to your Vercel frontend URL

### Frontend on Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Set environment variable `REACT_APP_API_URL` to your Render backend URL
4. Deploy

### Docker Hub

```bash
# Build and push the backend image
docker build -t <your-dockerhub-username>/stockflow-backend:latest ./backend
docker push <your-dockerhub-username>/stockflow-backend:latest
```

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   └── models.py    # ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py   # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── context/
│   │   │   └── ToastContext.js
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── Sidebar.js
│   │   │   └── ConfirmDialog.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   └── Orders.js
│   │   └── utils/
│   │       └── api.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Business Rules Implemented

- Product SKU must be unique (409 on duplicate)
- Customer email must be unique (409 on duplicate)
- Product quantity cannot go below 0
- Orders fail with 422 if stock is insufficient
- Order total is calculated server-side (price × quantity per item)
- Cancelling an order restores inventory automatically
- Low stock threshold: ≤ 10 units (shown on dashboard)