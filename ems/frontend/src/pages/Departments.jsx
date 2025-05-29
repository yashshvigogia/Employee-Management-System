import { useState, useEffect, useContext } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Avatar,
  Grid,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import departmentService from '../services/departmentService';
import employeeService from '../services/employeeService';

// Validation schema
const DepartmentSchema = Yup.object().shape({
  name: Yup.string().required('Department name is required'),
  description: Yup.string(),
  managerId: Yup.string(),
});

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const { hasPermission } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsResponse, employeesResponse] = await Promise.all([
        departmentService.getAllDepartments(),
        employeeService.getAllEmployees(),
      ]);
      setDepartments(departmentsResponse.data.departments);
      setEmployees(employeesResponse.data.employees);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error fetching data', 'error');
      setLoading(false);
    }
  };

  const handleOpenDialog = (department = null) => {
    setEditingDepartment(department);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, values);
        showSnackbar('Department updated successfully', 'success');
      } else {
        await departmentService.createDepartment(values);
        showSnackbar('Department created successfully', 'success');
      }
      handleCloseDialog();
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving department:', error);
      showSnackbar('Error saving department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentService.deleteDepartment(id);
        showSnackbar('Department deleted successfully', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting department:', error);
        showSnackbar('Error deleting department', 'error');
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
                <BusinessIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="700" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Department Management
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">
                  Organize and manage company departments
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={`${departments.length} Departments`}
                color="primary"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem'
                }}
              />
              {hasPermission('departments', 'create') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
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
                  Add Department
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modern Table */}
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
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Manager</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Employees</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((department) => {
                const manager = employees.find(
                  (employee) => employee.id === department.managerId
                );
                const departmentEmployees = employees.filter(
                  (employee) => employee.departmentId === department.id
                );

                return (
                  <TableRow
                    key={department.id}
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
                      <Typography variant="subtitle2" fontWeight="600">
                        {department.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {department.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {manager ? (
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              mr: 1,
                              width: 32,
                              height: 32,
                              background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                              fontSize: '0.875rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {manager.firstName.charAt(0)}{manager.lastName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight="500">
                            {`${manager.firstName} ${manager.lastName}`}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${departmentEmployees.length} employees`}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        {hasPermission('departments', 'update') && (
                          <Tooltip title="Edit Department">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog(department)}
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
                        {hasPermission('departments', 'delete') && (
                          <Tooltip title="Delete Department">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteDepartment(department.id)}
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
                );
              })}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No departments found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first department to get started
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Department Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDepartment ? 'Edit Department' : 'Add Department'}
        </DialogTitle>
        <Formik
          initialValues={{
            name: editingDepartment?.name || '',
            description: editingDepartment?.description || '',
            managerId: editingDepartment?.managerId || '',
          }}
          validationSchema={DepartmentSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="name"
                    label="Department Name"
                    fullWidth
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    select
                    name="managerId"
                    label="Department Manager"
                    fullWidth
                    error={touched.managerId && !!errors.managerId}
                    helperText={touched.managerId && errors.managerId}
                  >
                    <MenuItem value="">None</MenuItem>
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {`${employee.firstName} ${employee.lastName}`}
                      </MenuItem>
                    ))}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} color="secondary">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : editingDepartment ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Departments;
