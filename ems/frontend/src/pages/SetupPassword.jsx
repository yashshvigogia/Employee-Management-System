import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from '../contexts/SnackbarContext';
import authService from '../services/authService';

// Validation schema
const PasswordSetupSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token');
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await authService.verifyPasswordSetupToken(token);
      setTokenValid(true);
      setUserInfo(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Token verification error:', error);
      setError(error.response?.data?.message || 'Invalid or expired token');
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await authService.setupPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      showSnackbar('Password set successfully! You are now logged in.', 'success');
      
      // Store the token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Password setup error:', error);
      showSnackbar(error.response?.data?.message || 'Error setting up password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !tokenValid) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Invalid Link
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {error || 'The password setup link is invalid or has expired.'}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" gutterBottom color="primary">
                Welcome to EMS
              </Typography>
              <Typography variant="h6" gutterBottom>
                Set Your Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hello {userInfo?.employee?.firstName} {userInfo?.employee?.lastName}!
                Please set your password to complete your account setup.
              </Typography>
            </Box>

            <Formik
              initialValues={{
                password: '',
                confirmPassword: '',
              }}
              validationSchema={PasswordSetupSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Box mb={3}>
                    <Field
                      as={TextField}
                      name="password"
                      type="password"
                      label="New Password"
                      fullWidth
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
                    />
                  </Box>

                  <Box mb={3}>
                    <Field
                      as={TextField}
                      name="confirmPassword"
                      type="password"
                      label="Confirm Password"
                      fullWidth
                      error={touched.confirmPassword && !!errors.confirmPassword}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                    sx={{ mb: 2 }}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Set Password & Login'}
                  </Button>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Your password must be at least 6 characters long.
                  </Alert>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SetupPassword;
