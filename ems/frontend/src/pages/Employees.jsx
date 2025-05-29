import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
  Grid,
  Fade,
  Grow,
  Tooltip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import employeeService from '../services/employeeService';
import UserAvatar from '../components/UserAvatar';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
  const { hasPermission } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      setFilteredEmployees(
        employees.filter(
          (employee) =>
            employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.department && employee.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAllEmployees();
      setEmployees(response.data.employees);
      setFilteredEmployees(response.data.employees);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showSnackbar('Error fetching employees', 'error');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddEmployee = () => {
    navigate('/employees/add');
  };

  const handleEditEmployee = (id) => {
    navigate(`/employees/edit/${id}`);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.deleteEmployee(id);
        showSnackbar('Employee deleted successfully', 'success');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        showSnackbar('Error deleting employee', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const theme = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}05 100%)`,
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      {/* Modern Header with Glassmorphism */}
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
                <PeopleIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="700" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Employee Management
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">
                  Manage your team members and their information
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={`${filteredEmployees.length} Employees`}
                color="primary"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem'
                }}
              />
              {hasPermission('employees', 'create') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddEmployee}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Add Employee
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modern Search and Controls */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          p: 4,
          mb: 4,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} lg={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search employees by name, email, position, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(99, 102, 241, 0.15)',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', lg: 'flex-end' }} alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={`${filteredEmployees.length} Results`}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  border: `2px solid ${theme.palette.primary.main}20`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <IconButton
                  onClick={() => setViewMode('table')}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    backgroundColor: viewMode === 'table' ? theme.palette.primary.main : 'transparent',
                    color: viewMode === 'table' ? 'white' : theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: viewMode === 'table' ? theme.palette.primary.dark : `${theme.palette.primary.main}10`,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ViewListIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('cards')}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    backgroundColor: viewMode === 'cards' ? theme.palette.primary.main : 'transparent',
                    color: viewMode === 'cards' ? 'white' : theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: viewMode === 'cards' ? theme.palette.primary.dark : `${theme.palette.primary.main}10`,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modern Table View */}
      {viewMode === 'table' && (
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}05)`,
                }}>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee, index) => (
                    <TableRow
                      key={employee.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}08`,
                          transform: 'scale(1.01)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={employee.employeeId}
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <UserAvatar
                            employee={employee}
                            size={40}
                            sx={{
                              mr: 2,
                              fontWeight: 'bold'
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              {`${employee.firstName} ${employee.lastName}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Employee #{employee.employeeId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {employee.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.position}
                          variant="outlined"
                          size="small"
                          color="info"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {employee.department ? employee.department.name : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.user?.role?.name || 'No Role'}
                          color={employee.user?.role?.name === 'Admin' ? 'error' :
                                 employee.user?.role?.name === 'HR Manager' ? 'warning' : 'primary'}
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.isActive ? 'Active' : 'Inactive'}
                          color={employee.isActive ? 'success' : 'error'}
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          {hasPermission('employees', 'update') && (
                            <Tooltip title="Edit Employee">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditEmployee(employee.id)}
                                sx={{
                                  backgroundColor: `${theme.palette.primary.main}15`,
                                  '&:hover': {
                                    backgroundColor: `${theme.palette.primary.main}25`,
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {hasPermission('employees', 'delete') && (
                            <Tooltip title="Delete Employee">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteEmployee(employee.id)}
                                sx={{
                                  backgroundColor: `${theme.palette.error.main}15`,
                                  '&:hover': {
                                    backgroundColor: `${theme.palette.error.main}25`,
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No employees found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search criteria or add new employees
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Modern Card View */}
      {viewMode === 'cards' && (
        <Grid container spacing={4}>
          {filteredEmployees
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((employee, index) => (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={employee.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: 380, // Fixed height for consistency
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                      '&::before': {
                        opacity: 1,
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      opacity: 0.7,
                      transition: 'opacity 0.3s ease',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Employee Avatar and Basic Info */}
                    <Box display="flex" alignItems="center" mb={3}>
                      <UserAvatar
                        employee={employee}
                        size={64}
                        fontSize="1.5rem"
                        sx={{
                          mr: 2,
                          fontWeight: 'bold',
                          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                          {`${employee.firstName} ${employee.lastName}`}
                        </Typography>
                        <Chip
                          label={employee.employeeId}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3, opacity: 0.3 }} />

                    {/* Employee Details */}
                    <Box sx={{ mb: 3, space: 2 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <EmailIcon sx={{ fontSize: 18, color: theme.palette.primary.main, mr: 1.5 }} />
                        <Typography variant="body2" fontWeight="500" noWrap>
                          {employee.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <WorkIcon sx={{ fontSize: 18, color: theme.palette.secondary.main, mr: 1.5 }} />
                        <Typography variant="body2" fontWeight="500" noWrap>
                          {employee.position}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <BusinessIcon sx={{ fontSize: 18, color: theme.palette.info.main, mr: 1.5 }} />
                        <Typography variant="body2" fontWeight="500" noWrap>
                          {employee.department ? employee.department.name : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status and Role */}
                    <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                      <Chip
                        label={employee.isActive ? 'Active' : 'Inactive'}
                        color={employee.isActive ? 'success' : 'error'}
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={employee.user?.role?.name || 'No Role'}
                        color={employee.user?.role?.name === 'Admin' ? 'error' :
                               employee.user?.role?.name === 'HR Manager' ? 'warning' : 'primary'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>

                  {/* Action Buttons */}
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      {hasPermission('employees', 'update') && (
                        <Tooltip title="Edit Employee">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditEmployee(employee.id)}
                            sx={{
                              backgroundColor: `${theme.palette.primary.main}15`,
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}25`,
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {hasPermission('employees', 'delete') && (
                        <Tooltip title="Delete Employee">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            sx={{
                              backgroundColor: `${theme.palette.error.main}15`,
                              '&:hover': {
                                backgroundColor: `${theme.palette.error.main}25`,
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}

          {/* No Results Message for Cards */}
          {filteredEmployees.length === 0 && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No employees found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria or add new employees
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Modern Pagination */}
      {filteredEmployees.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
          }}
        >
          <TablePagination
            rowsPerPageOptions={[8, 12, 16, 24]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-toolbar': {
                padding: '16px 24px',
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 600,
                color: theme.palette.primary.main,
              },
              '& .MuiTablePagination-select': {
                fontWeight: 600,
              },
              '& .MuiIconButton-root': {
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default Employees;
