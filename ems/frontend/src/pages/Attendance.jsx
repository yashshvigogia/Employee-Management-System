import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
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
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Tooltip,
  Fade,
  Slide,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  Notes as NotesIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';

// Helper function to format datetime for input
const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return '';

  // Create a new Date object from the string
  const date = new Date(dateTimeString);

  // Check if the date is valid
  if (isNaN(date.getTime())) return '';

  // Get the local date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Return in YYYY-MM-DDTHH:MM format for datetime-local input
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Validation schema
const AttendanceSchema = Yup.object().shape({
  employeeId: Yup.string().required('Employee is required'),
  date: Yup.date().required('Date is required'),
  status: Yup.string().required('Status is required'),
  checkIn: Yup.string(),
  checkOut: Yup.string().when('checkIn', (checkIn, schema) => {
    return checkIn && checkIn.length > 0
      ? schema.test('is-after', 'Check-out time must be after check-in time', function(value) {
          if (!value) return true;
          return new Date(value) > new Date(checkIn);
        })
      : schema;
  }),
  notes: Yup.string(),
});

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const { user, hasPermission } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch employees
      const employeesResponse = await employeeService.getAllEmployees();
      setEmployees(employeesResponse.data.employees);

      // Format date for API
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Fetch attendance records for the selected date
      const attendanceResponse = await attendanceService.getAllAttendances();

      // Filter attendance records for the selected date
      const filteredAttendances = attendanceResponse.data.attendances.filter(
        (attendance) => attendance.date.substring(0, 10) === formattedDate
      );

      setAttendances(filteredAttendances);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error fetching data', 'error');
      setLoading(false);
    }
  };

  const handleOpenDialog = (attendance = null) => {
    setEditingAttendance(attendance);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAttendance(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Format the data before sending
      const formattedValues = {
        ...values,
        date: values.date ? values.date.toISOString().split('T')[0] : null,
        checkIn: values.checkIn ? new Date(values.checkIn).toISOString() : null,
        checkOut: values.checkOut ? new Date(values.checkOut).toISOString() : null,
      };

      console.log('Submitting attendance data:', formattedValues);

      if (editingAttendance) {
        await attendanceService.updateAttendance(editingAttendance.id, formattedValues);
        showSnackbar('Attendance record updated successfully', 'success');
      } else {
        await attendanceService.createAttendance(formattedValues);
        showSnackbar('Attendance record created successfully', 'success');
      }
      handleCloseDialog();
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving attendance record:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Error saving attendance record';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceService.deleteAttendance(id);
        showSnackbar('Attendance record deleted successfully', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting attendance record:', error);
        showSnackbar('Error deleting attendance record', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'error';
      case 'Late':
        return 'warning';
      case 'Half-day':
        return 'info';
      case 'On Leave':
        return 'secondary';
      default:
        return 'default';
    }
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
                <ScheduleIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="700" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Attendance Management
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">
                  Track and manage employee attendance records
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={`${attendances.length} Records`}
                color="primary"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem'
                }}
              />
              {hasPermission('attendance', 'create') && (
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
                  Add Attendance
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modern Controls Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          mb: 3,
          p: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Select Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              View Mode
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                startIcon={<ViewListIcon />}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                startIcon={<ViewModuleIcon />}
                onClick={() => setViewMode('cards')}
                size="small"
              >
                Cards
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Summary
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`Total: ${attendances.length}`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Present: ${attendances.filter(a => a.status === 'Present').length}`}
                color="success"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Modern Content Section */}
      {viewMode === 'table' ? (
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
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Check In</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Check Out</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Work Hours</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Notes</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendances.map((attendance) => {
                  const employee = employees.find(
                    (emp) => emp.id === attendance.employeeId
                  );

                  return (
                    <TableRow
                      key={attendance.id}
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
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                            {employee ? employee.firstName[0] : 'U'}
                          </Avatar>
                          <Typography variant="body2">
                            {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(attendance.date), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {attendance.checkIn ? format(new Date(attendance.checkIn), 'HH:mm') : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {attendance.checkOut ? format(new Date(attendance.checkOut), 'HH:mm') : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={attendance.status}
                          color={getStatusColor(attendance.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {attendance.workHours || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {attendance.notes || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {hasPermission('attendance', 'update') && (
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDialog(attendance)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {hasPermission('attendance', 'delete') && (
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteAttendance(attendance.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {attendances.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No attendance records found for this date
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {attendances.map((attendance) => {
            const employee = employees.find(
              (emp) => emp.id === attendance.employeeId
            );

            return (
              <Grid item xs={12} sm={6} md={4} key={attendance.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {employee ? employee.firstName[0] : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(attendance.date), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Check In:</Typography>
                      <Typography variant="body2">
                        {attendance.checkIn ? format(new Date(attendance.checkIn), 'HH:mm') : 'N/A'}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Check Out:</Typography>
                      <Typography variant="body2">
                        {attendance.checkOut ? format(new Date(attendance.checkOut), 'HH:mm') : 'N/A'}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip
                        label={attendance.status}
                        color={getStatusColor(attendance.status)}
                        size="small"
                      />
                    </Box>

                    {attendance.workHours && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">Work Hours:</Typography>
                        <Typography variant="body2">{attendance.workHours}</Typography>
                      </Box>
                    )}

                    {attendance.notes && (
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Notes:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {attendance.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    <Box display="flex" gap={1}>
                      {hasPermission('attendance', 'update') && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog(attendance)}
                        >
                          Edit
                        </Button>
                      )}
                      {hasPermission('attendance', 'delete') && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteAttendance(attendance.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}

          {attendances.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No attendance records found for this date
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Attendance Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAttendance ? 'Edit Attendance Record' : 'Add Attendance Record'}
        </DialogTitle>
        <Formik
          enableReinitialize={true}
          initialValues={{
            employeeId: editingAttendance?.employeeId || (user?.employeeId || ''),
            date: editingAttendance?.date
              ? new Date(editingAttendance.date)
              : selectedDate,
            status: editingAttendance?.status || 'Present',
            checkIn: editingAttendance?.checkIn
              ? formatDateTimeForInput(editingAttendance.checkIn)
              : '',
            checkOut: editingAttendance?.checkOut
              ? formatDateTimeForInput(editingAttendance.checkOut)
              : '',
            notes: editingAttendance?.notes || '',
          }}
          validationSchema={AttendanceSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <DialogContent>
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
                <Box mb={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={values.date}
                      onChange={(date) => setFieldValue('date', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.date && !!errors.date,
                          helperText: touched.date && errors.date
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    select
                    name="status"
                    label="Status"
                    fullWidth
                    error={touched.status && !!errors.status}
                    helperText={touched.status && errors.status}
                  >
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                    <MenuItem value="Late">Late</MenuItem>
                    <MenuItem value="Half-day">Half-day</MenuItem>
                    <MenuItem value="On Leave">On Leave</MenuItem>
                  </Field>
                </Box>
                <Box mb={2}>
                  <TextField
                    label="Check In Time"
                    type="datetime-local"
                    value={values.checkIn || ''}
                    onChange={(e) => setFieldValue('checkIn', e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    label="Check Out Time"
                    type="datetime-local"
                    value={values.checkOut || ''}
                    onChange={(e) => setFieldValue('checkOut', e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="notes"
                    label="Notes"
                    fullWidth
                    multiline
                    rows={2}
                    error={touched.notes && !!errors.notes}
                    helperText={touched.notes && errors.notes}
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
                  ) : editingAttendance ? (
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

export default Attendance;
