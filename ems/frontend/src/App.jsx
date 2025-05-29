import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import modernTheme from './theme/modernTheme';

// Pages
import Login from './pages/Login';
import DebugLogin from './pages/DebugLogin';
import SetupPassword from './pages/SetupPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import Departments from './pages/Departments';
import Roles from './pages/Roles';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';



function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <SnackbarProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/debug-login" element={<DebugLogin />} />
              <Route path="/setup-password" element={<SetupPassword />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="employees/add" element={<EmployeeForm />} />
                <Route path="employees/edit/:id" element={<EmployeeForm />} />
                <Route path="departments" element={<Departments />} />
                <Route path="roles" element={<Roles />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leaves" element={<LeaveRequests />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
