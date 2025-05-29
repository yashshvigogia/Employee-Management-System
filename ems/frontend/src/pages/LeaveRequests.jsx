import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  Chip,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Avatar,
  Grid,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import leaveService from '../services/leaveService';
import employeeService from '../services/employeeService';

// Validation schema - dynamic based on whether editing or creating
const getLeaveRequestSchema = (isEditing = false, userRole = '') => {
  try {
    return Yup.object().shape({
      employeeId: userRole === 'Employee'
        ? Yup.string().nullable() // Not required for employees as it's auto-set
        : Yup.string().required('Employee is required'),
      leaveType: Yup.string().required('Leave type is required'),
      startDate: Yup.date()
        .required('Start date is required')
        .test('not-past', 'Start date cannot be in the past', function(value) {
          if (isEditing) return true; // Allow past dates when editing
          if (!value) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        }),
      endDate: Yup.date()
        .required('End date is required')
        .min(Yup.ref('startDate'), 'End date must be after or equal to start date'),
      reason: Yup.string().required('Reason is required'),
    });
  } catch (error) {
    console.error('Error creating validation schema:', error);
    // Return a basic schema if there's an error
    return Yup.object().shape({
      leaveType: Yup.string().required('Leave type is required'),
      reason: Yup.string().required('Reason is required'),
    });
  }
};

const ApproveRejectSchema = Yup.object().shape({
  status: Yup.string().required('Status is required'),
  comments: Yup.string(),
});

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState(null);
  const [approvingLeaveRequest, setApprovingLeaveRequest] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { user, hasPermission } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch employees
      const employeesResponse = await employeeService.getAllEmployees();
      setEmployees(employeesResponse.data.employees || []);

      // Fetch leave requests
      const leaveResponse = await leaveService.getAllLeaveRequests();
      setLeaveRequests(leaveResponse.data.leaveRequests || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error fetching data', 'error');
      setLoading(false);
    }
  };

  const handleOpenDialog = (leaveRequest = null) => {
    try {
      // Ensure user data is loaded before opening dialog
      if (!user) {
        showSnackbar('User data not loaded. Please refresh the page.', 'error');
        return;
      }

      setEditingLeaveRequest(leaveRequest);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error opening dialog:', error);
      showSnackbar('Error opening leave request form', 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLeaveRequest(null);
  };

  const handleOpenApproveDialog = (leaveRequest) => {
    setApprovingLeaveRequest(leaveRequest);
    setOpenApproveDialog(true);
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setApprovingLeaveRequest(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Validate dates before formatting
      if (!values.startDate || !values.endDate) {
        throw new Error('Start date and end date are required');
      }

      // Ensure employeeId is set for employees
      let employeeId = values.employeeId;
      if (user?.role === 'Employee' && user?.employeeId) {
        employeeId = user.employeeId;
      }

      if (!employeeId) {
        throw new Error('Employee ID is required');
      }

      // Format dates to YYYY-MM-DD format
      const formattedValues = {
        ...values,
        employeeId,
        startDate: format(new Date(values.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(values.endDate), 'yyyy-MM-dd'),
      };

      if (editingLeaveRequest) {
        await leaveService.updateLeaveRequest(editingLeaveRequest.id, formattedValues);
        showSnackbar('Leave request updated successfully', 'success');
      } else {
        await leaveService.createLeaveRequest(formattedValues);
        showSnackbar('Leave request created successfully', 'success');
      }
      handleCloseDialog();
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving leave request:', error);
      showSnackbar(error.response?.data?.message || error.message || 'Error saving leave request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReject = async (values, { setSubmitting }) => {
    try {
      console.log('Attempting to update leave request:', {
        id: approvingLeaveRequest.id,
        status: values.status,
        comments: values.comments,
        userRole: user?.role
      });

      await leaveService.approveLeaveRequest(approvingLeaveRequest.id, values.status, values.comments);
      showSnackbar(`Leave request ${values.status.toLowerCase()} successfully`, 'success');
      handleCloseApproveDialog();
      fetchData();
    } catch (error) {
      console.error('Error updating leave request status:', error);
      console.error('Error response:', error.response);

      let errorMessage = 'Error updating leave request status';

      if (error.response?.status === 403) {
        errorMessage = `Access denied: You don't have permission to ${values.status.toLowerCase()} leave requests. Required role: Admin, HR, or Manager.`;
      } else if (error.response?.status === 404) {
        errorMessage = 'Leave request not found';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request data';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeaveRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leaveService.deleteLeaveRequest(id);
        showSnackbar('Leave request deleted successfully', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting leave request:', error);
        showSnackbar('Error deleting leave request', 'error');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getFilteredLeaveRequests = () => {
    if (tabValue === 0) {
      return leaveRequests;
    } else if (tabValue === 1) {
      return leaveRequests.filter((leave) => leave.status === 'Pending');
    } else if (tabValue === 2) {
      return leaveRequests.filter((leave) => leave.status === 'Approved');
    } else {
      return leaveRequests.filter((leave) => leave.status === 'Rejected');
    }
  };

  if (loading || !user) {
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
                <EventNoteIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="700" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Leave Management
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">
                  {user?.role === 'Employee'
                    ? 'Manage your leave applications and view their status'
                    : 'Manage employee leave requests and approvals'
                  }
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={`${getFilteredLeaveRequests().length} Requests`}
                color="primary"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem'
                }}
              />
              {hasPermission('leaves', 'create') && (
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
                  {user?.role === 'Employee' ? 'Apply for Leave' : 'Create Leave Request'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modern Filter Tabs and Table */}
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
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              }
            }
          }}
        >
          <Tab label={`All (${leaveRequests.length})`} />
          <Tab label={`Pending (${leaveRequests.filter(l => l.status === 'Pending').length})`} />
          <Tab label={`Approved (${leaveRequests.filter(l => l.status === 'Approved').length})`} />
          <Tab label={`Rejected (${leaveRequests.filter(l => l.status === 'Rejected').length})`} />
        </Tabs>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}05)`,
              }}>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredLeaveRequests().map((leave) => {
                const employee = employees.find(
                  (emp) => emp.id === leave.employeeId
                );
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);
                const duration = differenceInDays(endDate, startDate) + 1;

                return (
                  <TableRow
                    key={leave.id}
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
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {employee
                            ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
                            : 'U'
                          }
                        </Avatar>
                        {employee
                          ? `${employee.firstName} ${employee.lastName}`
                          : 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.leaveType}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{format(startDate, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(endDate, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {`${duration} day${duration > 1 ? 's' : ''}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                        {leave.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        color={getStatusColor(leave.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        {leave.status === 'Pending' && hasPermission('leaves', 'approve') && (
                          <Tooltip title="Approve or Reject">
                            <IconButton
                              color="success"
                              onClick={() => handleOpenApproveDialog(leave)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {leave.status === 'Pending' &&
                          (hasPermission('leaves', 'update') ||
                            leave.employeeId === user?.employeeId) && (
                            <Tooltip title="Edit Leave Request">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(leave)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        {leave.status === 'Pending' &&
                          (hasPermission('leaves', 'delete') ||
                            leave.employeeId === user?.employeeId) && (
                            <Tooltip title="Delete Leave Request">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteLeaveRequest(leave.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        {leave.status !== 'Pending' && (
                          <Typography variant="body2" color="text.secondary">
                            No actions
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {getFilteredLeaveRequests().length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No leave requests found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tabValue === 0
                          ? 'No leave requests have been created yet'
                          : `No ${['', 'pending', 'approved', 'rejected'][tabValue]} leave requests found`
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Leave Request Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLeaveRequest
            ? 'Edit Leave Request'
            : (user?.role === 'Employee' ? 'Apply for Leave' : 'Create Leave Request')
          }
        </DialogTitle>
        <Formik
          initialValues={{
            employeeId: editingLeaveRequest?.employeeId || user?.employeeId || '',
            leaveType: editingLeaveRequest?.leaveType || 'Annual',
            startDate: editingLeaveRequest?.startDate
              ? new Date(editingLeaveRequest.startDate)
              : new Date(),
            endDate: editingLeaveRequest?.endDate
              ? new Date(editingLeaveRequest.endDate)
              : new Date(),
            reason: editingLeaveRequest?.reason || '',
          }}
          validationSchema={getLeaveRequestSchema(!!editingLeaveRequest, user?.role || '')}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <DialogContent>
                {/* Show info for employees about whose leave they're applying for */}
                {user?.role === 'Employee' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You are applying for leave for yourself.
                  </Alert>
                )}

                {/* Only show employee selection for admins/HR who can create leave for others */}
                {hasPermission('employees', 'read') && user?.role !== 'Employee' && (
                  <Box mb={2}>
                    <Field
                      as={TextField}
                      select
                      name="employeeId"
                      label="Employee"
                      fullWidth
                      error={touched.employeeId && !!errors.employeeId}
                      helperText={touched.employeeId && errors.employeeId}
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {`${employee.firstName} ${employee.lastName}`}
                        </MenuItem>
                      ))}
                    </Field>
                  </Box>
                )}
                <Box mb={2}>
                  <Field
                    as={TextField}
                    select
                    name="leaveType"
                    label="Leave Type"
                    fullWidth
                    error={touched.leaveType && !!errors.leaveType}
                    helperText={touched.leaveType && errors.leaveType}
                  >
                    <MenuItem value="Annual">Annual</MenuItem>
                    <MenuItem value="Sick">Sick</MenuItem>
                    <MenuItem value="Maternity">Maternity</MenuItem>
                    <MenuItem value="Paternity">Paternity</MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Field>
                </Box>
                <Box mb={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={values.startDate}
                      onChange={(date) => setFieldValue('startDate', date)}
                      minDate={editingLeaveRequest ? undefined : new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.startDate && !!errors.startDate,
                          helperText: touched.startDate && errors.startDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box mb={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={values.endDate}
                      onChange={(date) => setFieldValue('endDate', date)}
                      minDate={values.startDate || (editingLeaveRequest ? undefined : new Date())}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.endDate && !!errors.endDate,
                          helperText: touched.endDate && errors.endDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="reason"
                    label="Reason"
                    fullWidth
                    multiline
                    rows={3}
                    error={touched.reason && !!errors.reason}
                    helperText={touched.reason && errors.reason}
                  />
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
                  ) : editingLeaveRequest ? (
                    'Update'
                  ) : (
                    'Submit'
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={handleCloseApproveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve or Reject Leave Request</DialogTitle>
        <Formik
          initialValues={{
            status: 'Approved',
            comments: '',
          }}
          validationSchema={ApproveRejectSchema}
          onSubmit={handleApproveReject}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                {approvingLeaveRequest && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Leave Request Details:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Employee:</strong> {
                        employees.find(emp => emp.id === approvingLeaveRequest.employeeId)
                          ? `${employees.find(emp => emp.id === approvingLeaveRequest.employeeId).firstName} ${employees.find(emp => emp.id === approvingLeaveRequest.employeeId).lastName}`
                          : 'Unknown'
                      }
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {approvingLeaveRequest.leaveType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {format(new Date(approvingLeaveRequest.startDate), 'MMM dd, yyyy')} - {format(new Date(approvingLeaveRequest.endDate), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reason:</strong> {approvingLeaveRequest.reason}
                    </Typography>
                  </Alert>
                )}

                <Box mb={2}>
                  <Field
                    as={TextField}
                    select
                    name="status"
                    label="Decision"
                    fullWidth
                    error={touched.status && !!errors.status}
                    helperText={touched.status && errors.status}
                  >
                    <MenuItem value="Approved">✅ Approve</MenuItem>
                    <MenuItem value="Rejected">❌ Reject</MenuItem>
                  </Field>
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="comments"
                    label="Comments (Optional)"
                    placeholder="Add any comments about your decision..."
                    fullWidth
                    multiline
                    rows={3}
                    error={touched.comments && !!errors.comments}
                    helperText={touched.comments && errors.comments}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseApproveDialog} color="secondary">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Submit Decision'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default LeaveRequests;
