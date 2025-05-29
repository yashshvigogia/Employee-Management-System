# Employee Management System (EMSS)

A full-stack Employee Management System built with PostgreSQL, Node.js, Express.js, and React.js.

## Features

- **User Authentication**: Secure login with JWT and role-based access control
- **Employee Management**: CRUD operations for employee records
- **Leave Management**: Apply, approve, and track leave requests
- **Attendance Tracking**: Mark and monitor employee attendance
- **Department & Role Management**: Organize employees by department and role
- **Analytics Dashboard**: Visual representation of key metrics

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Bcrypt for password hashing

### Frontend
- React.js (with Hooks and Context API)
- Material-UI
- React Router
- Axios
- Formik & Yup for form validation
- Recharts for analytics

### DevOps
- Docker & Docker Compose
- Environment management with dotenv

## Project Structure

```
emss/
├── backend/         # Node.js + Express.js API
├── frontend/        # React.js application
├── docker-compose.yml # Docker configuration
└── README.md        # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository
2. Set up the backend:
   ```
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

3. Set up the frontend:
   ```
   cd frontend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

4. Using Docker (optional):
   ```
   docker-compose up
   ```

## Demo Credentials

- **Admin**: username: `admin`, password: `admin123`
- **HR**: username: `hr`, password: `hr123`
- **Manager**: username: `manager`, password: `manager123`
- **Employee**: username: `employee`, password: `employee123`

## Features by Role

### Admin
- Full access to all features
- Manage employees, departments, roles
- Approve/reject leave requests
- View attendance records and statistics

### HR
- Manage employees
- View departments and roles
- Approve/reject leave requests
- Manage attendance records

### Manager
- View team members
- Approve/reject leave requests for team members
- View team attendance

### Employee
- View personal profile
- Apply for leave
- Mark attendance
- View personal attendance history

## License

MIT
