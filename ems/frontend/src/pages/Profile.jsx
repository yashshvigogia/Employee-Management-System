import { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  MenuItem,
  Tooltip,
  useTheme,
  Grow,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import profileService from '../services/profileService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import UserAvatar from '../components/UserAvatar';

// Validation schemas
const PasswordChangeSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ProfileEditSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  username: Yup.string().required('Username is required'),
  phone: Yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  address: Yup.string(),
  dateOfBirth: Yup.date().nullable(),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Invalid gender'),
});

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchData();
  }, []); // Remove user dependency to prevent infinite loop

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch profile data
      const profileResponse = await profileService.getProfile();
      const userData = profileResponse.data.user;
      setEmployeeData(userData.employee);

      // Don't update user context here to prevent re-render loops
      // User context will be updated specifically after profile picture upload

      // Fetch leave requests if employee exists
      if (userData.employee) {
        try {
          const leaveResponse = await leaveService.getLeaveRequestsByEmployeeId(userData.employee.id);
          setLeaveRequests(leaveResponse.data.leaveRequests);
        } catch (error) {
          console.log('No leave requests found');
          setLeaveRequests([]);
        }

        // Fetch attendance records (last 30 days)
        try {
          const today = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);

          const attendanceResponse = await attendanceService.getAttendancesByEmployeeId(
            userData.employee.id,
            format(thirtyDaysAgo, 'yyyy-MM-dd'),
            format(today, 'yyyy-MM-dd')
          );
          setAttendanceRecords(attendanceResponse.data.attendances);
        } catch (error) {
          console.log('No attendance records found');
          setAttendanceRecords([]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      showSnackbar('Error fetching profile data', 'error');
      setLoading(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleChangePassword = async (values, { setSubmitting, resetForm }) => {
    try {
      await profileService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      showSnackbar('Password changed successfully', 'success');
      handleClosePasswordDialog();
      resetForm();
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Error changing password';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async (values, { setSubmitting }) => {
    try {
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        phone: values.phone,
        address: values.address,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
      };

      await profileService.updateProfile(updateData);
      showSnackbar('Profile updated successfully', 'success');
      handleCloseEditDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showSnackbar('Please select a valid image file (JPEG, PNG, GIF)', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('File size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      await profileService.uploadProfilePicture(file);
      showSnackbar('Profile picture updated successfully', 'success');

      // Refresh data and update user context
      await fetchData();

      // Specifically update user context with fresh profile data
      if (updateUser) {
        const profileResponse = await profileService.getProfile();
        updateUser(profileResponse.data.user);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || 'Error uploading profile picture';
      showSnackbar(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
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
      {/* Modern Header */}
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
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                <PersonIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="700" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  My Profile
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">
                  Manage your personal information and account settings
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleOpenEditDialog}
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
                Edit Profile
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Profile Picture and Basic Info */}
        <Grid item xs={12} md={4}>
          <Grow in={!loading} timeout={600}>
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                p: 4,
                height: 'fit-content',
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Box position="relative" mb={3}>
                  <UserAvatar
                    user={user}
                    employee={employeeData}
                    size={120}
                    fontSize={48}
                    sx={{
                      border: `4px solid ${theme.palette.primary.main}20`,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <Tooltip title="Change Profile Picture">
                    <IconButton
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        width: 40,
                        height: 40,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="h5" fontWeight="600" textAlign="center" mb={1}>
                  {employeeData
                    ? `${employeeData.firstName} ${employeeData.lastName}`
                    : user?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
                  {employeeData?.position || user?.role}
                </Typography>
                <Chip
                  label={user?.role}
                  color="primary"
                  variant="filled"
                  sx={{
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                  }}
                />
              </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Username" secondary={user?.username} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={user?.email || employeeData?.email} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Last Login"
                  secondary={
                    user?.lastLogin
                      ? format(new Date(user.lastLogin), 'yyyy-MM-dd HH:mm:ss')
                      : 'N/A'
                  }
                />
              </ListItem>
            </List>

            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={handleOpenPasswordDialog}
              >
                Change Password
              </Button>
            </Box>
          </Paper>
          </Grow>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            {employeeData ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1">{employeeData.employeeId}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {employeeData.department?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{employeeData.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Hire Date
                  </Typography>
                  <Typography variant="body1">
                    {employeeData.hireDate
                      ? format(new Date(employeeData.hireDate), 'yyyy-MM-dd')
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {employeeData.address || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1">No employee data available</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Leave Requests
            </Typography>
            {leaveRequests.length > 0 ? (
              <List dense>
                {leaveRequests.slice(0, 5).map((leave) => (
                  <ListItem key={leave.id}>
                    <ListItemText
                      primary={`${leave.leaveType} Leave (${format(
                        new Date(leave.startDate),
                        'yyyy-MM-dd'
                      )} to ${format(new Date(leave.endDate), 'yyyy-MM-dd')})`}
                      secondary={leave.reason}
                    />
                    <Chip
                      label={leave.status}
                      color={
                        leave.status === 'Approved'
                          ? 'success'
                          : leave.status === 'Rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1">No leave requests found</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Attendance
            </Typography>
            {attendanceRecords.length > 0 ? (
              <List dense>
                {attendanceRecords.slice(0, 5).map((attendance) => (
                  <ListItem key={attendance.id}>
                    <ListItemText
                      primary={format(new Date(attendance.date), 'yyyy-MM-dd')}
                      secondary={`Check In: ${
                        attendance.checkIn
                          ? format(new Date(attendance.checkIn), 'HH:mm:ss')
                          : 'N/A'
                      }, Check Out: ${
                        attendance.checkOut
                          ? format(new Date(attendance.checkOut), 'HH:mm:ss')
                          : 'N/A'
                      }`}
                    />
                    <Chip
                      label={attendance.status}
                      color={
                        attendance.status === 'Present'
                          ? 'success'
                          : attendance.status === 'Absent'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1">No attendance records found</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Profile Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          fontWeight: 700,
        }}>
          Edit Profile
        </DialogTitle>
        <Formik
          initialValues={{
            firstName: employeeData?.firstName || '',
            lastName: employeeData?.lastName || '',
            username: user?.username || '',
            phone: employeeData?.phone || '',
            address: employeeData?.address || '',
            dateOfBirth: employeeData?.dateOfBirth || '',
            gender: employeeData?.gender || '',
          }}
          validationSchema={ProfileEditSchema}
          onSubmit={handleUpdateProfile}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="firstName"
                      label="First Name"
                      fullWidth
                      error={touched.firstName && !!errors.firstName}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="lastName"
                      label="Last Name"
                      fullWidth
                      error={touched.lastName && !!errors.lastName}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="username"
                      label="Username"
                      fullWidth
                      error={touched.username && !!errors.username}
                      helperText={touched.username && errors.username}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="phone"
                      label="Phone Number"
                      fullWidth
                      error={touched.phone && !!errors.phone}
                      helperText={touched.phone && errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={touched.dateOfBirth && !!errors.dateOfBirth}
                      helperText={touched.dateOfBirth && errors.dateOfBirth}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="gender"
                      label="Gender"
                      select
                      fullWidth
                      error={touched.gender && !!errors.gender}
                      helperText={touched.gender && errors.gender}
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="address"
                      label="Address"
                      multiline
                      rows={3}
                      fullWidth
                      error={touched.address && !!errors.address}
                      helperText={touched.address && errors.address}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                  onClick={handleCloseEditDialog}
                  variant="outlined"
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    },
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          fontWeight: 700,
        }}>
          Change Password
        </DialogTitle>
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={PasswordChangeSchema}
          onSubmit={handleChangePassword}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent sx={{ p: 3 }}>
                <Box mb={3}>
                  <Field
                    as={TextField}
                    name="currentPassword"
                    label="Current Password"
                    type={showPassword.current ? 'text' : 'password'}
                    fullWidth
                    error={touched.currentPassword && !!errors.currentPassword}
                    helperText={touched.currentPassword && errors.currentPassword}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('current')}
                          edge="end"
                        >
                          {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
                <Box mb={3}>
                  <Field
                    as={TextField}
                    name="newPassword"
                    label="New Password"
                    type={showPassword.new ? 'text' : 'password'}
                    fullWidth
                    error={touched.newPassword && !!errors.newPassword}
                    helperText={touched.newPassword && errors.newPassword}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    as={TextField}
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showPassword.confirm ? 'text' : 'password'}
                    fullWidth
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                  onClick={handleClosePasswordDialog}
                  variant="outlined"
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    },
                  }}
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Profile;
