import { useState, useEffect, useContext } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Container,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Business as BusinessIcon,
  EventNote as EventNoteIcon,
  AssignmentTurnedIn as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import profileService from '../services/profileService';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    employeeCount: 0,
    departmentCount: 0,
    leaveRequestCount: 0,
    attendanceToday: 0,
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let employees = [];
      let departments = [];
      let leaves = [];
      let attendanceStats = { total: 0, statusCounts: {} };

      // Role-based data fetching
      if (user?.role === 'Employee') {
        // For employees, fetch only their own data
        try {
          // Get current user's employee data
          const profileRes = await profileService.getProfile();
          const currentEmployee = profileRes.data.user.employee;

          if (currentEmployee) {
            employees = [currentEmployee]; // Only current employee

            // Get employee's department
            if (currentEmployee.department) {
              departments = [currentEmployee.department];
            }

            // Get employee's leave requests only
            const leaveRes = await leaveService.getLeaveRequestsByEmployeeId(currentEmployee.id);
            leaves = leaveRes.data.leaveRequests || [];

            // Get employee's attendance for today
            const today = new Date().toISOString().split('T')[0];
            const attendanceRes = await attendanceService.getAttendancesByEmployeeId(
              currentEmployee.id,
              today,
              today
            );
            const todayAttendance = attendanceRes.data.attendances || [];
            attendanceStats = {
              total: todayAttendance.length,
              statusCounts: todayAttendance.reduce((acc, att) => {
                acc[att.status] = (acc[att.status] || 0) + 1;
                return acc;
              }, {})
            };
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
        }
      } else {
        // For admin/HR, fetch all data
        try {
          // Fetch all employees
          const employeeRes = await employeeService.getAllEmployees();
          employees = employeeRes.data.employees || [];

          // Fetch all departments
          const departmentRes = await departmentService.getAllDepartments();
          departments = departmentRes.data.departments || [];

          // Fetch all leave requests
          const leaveRes = await leaveService.getAllLeaveRequests();
          leaves = leaveRes.data.leaveRequests || [];

          // Fetch today's attendance stats for all employees
          const today = new Date().toISOString().split('T')[0];
          const attendanceRes = await attendanceService.getAttendanceStats(today, today);
          attendanceStats = attendanceRes.data.stats || { total: 0, statusCounts: {} };
        } catch (error) {
          console.error('Error fetching admin data:', error);
        }
      }

        // Set stats based on role
        setStats({
          employeeCount: user?.role === 'Employee' ? 1 : employees.length,
          departmentCount: departments.length,
          leaveRequestCount: leaves.length,
          attendanceToday: attendanceStats.total || 0,
        });

        // Store leaves in state for use in UI
        setLeaves(leaves);

        // Process department data for chart
        const deptData = departments.map(dept => ({
          name: dept.name,
          employees: employees.filter(emp => emp.departmentId === dept.id).length,
        }));
        setDepartmentData(deptData);

        // Process leave data for chart
        const leaveStatusCount = {
          Pending: 0,
          Approved: 0,
          Rejected: 0,
        };

        leaves.forEach(leave => {
          leaveStatusCount[leave.status]++;
        });

        const leaveChartData = Object.keys(leaveStatusCount).map(status => ({
          name: status,
          value: leaveStatusCount[status],
        }));
        setLeaveData(leaveChartData);

        // Process attendance data for chart
        const attendanceChartData = Object.keys(attendanceStats.statusCounts || {}).map(status => ({
          name: status,
          value: attendanceStats.statusCounts[status],
        }));
        setAttendanceData(attendanceChartData);

      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}10 100%)`,
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      {/* Modern Header with Glassmorphism Effect */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="700" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  {user?.role === 'Employee' ? 'My Dashboard' : 'Dashboard'}
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">
                  Welcome back, {user?.username}!
                  {user?.role === 'Employee' && ' Here\'s your personal overview.'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2}>
              <Chip
                label={user?.role || 'User'}
                color="primary"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem'
                }}
              />
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <RefreshIcon sx={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Interactive Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {user?.role !== 'Employee' && (
          <>
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                elevation={0}
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" fontWeight="700" color="primary.main" gutterBottom>
                        {stats.employeeCount}
                      </Typography>
                      <Typography variant="h6" color="text.secondary" fontWeight="500">
                        Total Employees
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                        <Typography variant="body2" color="success.main" fontWeight="600">
                          +12% from last month
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}40)`,
                        color: 'primary.main'
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                elevation={0}
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(236, 72, 153, 0.15)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" fontWeight="700" color="secondary.main" gutterBottom>
                        {stats.departmentCount}
                      </Typography>
                      <Typography variant="h6" color="text.secondary" fontWeight="500">
                        Departments
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                        <Typography variant="body2" color="success.main" fontWeight="600">
                          +2 new departments
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main}20, ${theme.palette.secondary.main}40)`,
                        color: 'secondary.main'
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={6} lg={user?.role === 'Employee' ? 6 : 3}>
          <Card
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 40px rgba(245, 158, 11, 0.15)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="700" color="warning.main" gutterBottom>
                    {stats.leaveRequestCount}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" fontWeight="500">
                    {user?.role === 'Employee' ? 'My Leave Requests' : 'Leave Requests'}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'info.main', mr: 0.5 }} />
                    <Typography variant="body2" color="info.main" fontWeight="600">
                      {user?.role === 'Employee'
                        ? `${leaves.filter(l => l.status === 'Pending').length} pending`
                        : `${leaves.filter(l => l.status === 'Pending').length} pending review`
                      }
                    </Typography>
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}20, ${theme.palette.warning.main}40)`,
                    color: 'warning.main'
                  }}
                >
                  <EventNoteIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={user?.role === 'Employee' ? 6 : 3}>
          <Card
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="700" color="success.main" gutterBottom>
                    {stats.attendanceToday}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" fontWeight="500">
                    {user?.role === 'Employee' ? 'My Attendance' : 'Today\'s Attendance'}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                    <Typography variant="body2" color="success.main" fontWeight="600">
                      {user?.role === 'Employee'
                        ? (stats.attendanceToday > 0 ? 'Present today' : 'No record today')
                        : `${stats.attendanceToday} records today`
                      }
                    </Typography>
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: `linear-gradient(135deg, ${theme.palette.success.main}20, ${theme.palette.success.main}40)`,
                    color: 'success.main'
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modern Charts Section */}
      <Grid container spacing={4}>
        {/* Department Employee Distribution */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              p: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  Employee Distribution
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Workforce distribution across departments
                </Typography>
              </Box>
              <Chip
                label={`${departmentData.length} Departments`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Box sx={{ height: 450, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(20px)',
                    }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  />
                  <Bar
                    dataKey="employees"
                    fill={`url(#barGradient)`}
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.palette.primary.main} />
                      <stop offset="100%" stopColor={theme.palette.primary.light} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Leave Requests Status */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              p: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.warning.main})`,
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  Leave Status
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Current leave request overview
                </Typography>
              </Box>
              <Chip
                label={`${stats.leaveRequestCount} Total`}
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Box sx={{ height: 450, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelStyle={{ fontSize: '14px', fontWeight: 'bold', fill: '#1e293b' }}
                  >
                    {leaveData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(20px)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
