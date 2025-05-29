import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  CircularProgress,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSnackbar } from '../contexts/SnackbarContext';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import roleService from '../services/roleService';

// Validation schema
const EmployeeSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string(),
  address: Yup.string(),
  position: Yup.string().required('Position is required'),
  departmentId: Yup.string(),
  managerId: Yup.string(),
  roleId: Yup.string().required('Role is required'),
  salary: Yup.number().positive('Salary must be positive').required('Salary is required'),
  hireDate: Yup.date().required('Hire date is required'),
  isActive: Yup.boolean(),
});

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    departmentId: '',
    managerId: '',
    roleId: '',
    salary: '',
    hireDate: new Date(),
    isActive: true,
  });
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [roles, setRoles] = useState([]);
  const isEditMode = !!id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch departments
        const departmentsResponse = await departmentService.getAllDepartments();
        setDepartments(departmentsResponse.data.departments);

        // Fetch roles
        const rolesResponse = await roleService.getAllRoles();
        setRoles(rolesResponse.data.roles);

        // Fetch potential managers (other employees)
        const employeesResponse = await employeeService.getAllEmployees();
        setManagers(employeesResponse.data.employees);

        // If in edit mode, fetch employee data
        if (isEditMode) {
          const employeeResponse = await employeeService.getEmployeeById(id);
          const employee = employeeResponse.data.employee;

          setInitialValues({
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            email: employee.email || '',
            phone: employee.phone || '',
            address: employee.address || '',
            position: employee.position || '',
            departmentId: employee.departmentId || '',
            managerId: employee.managerId || '',
            roleId: employee.user?.roleId || '',
            salary: employee.salary || '',
            hireDate: employee.hireDate ? new Date(employee.hireDate) : new Date(),
            isActive: employee.isActive !== undefined ? employee.isActive : true,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error fetching data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, showSnackbar]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Format the data before sending
      const formattedValues = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.toISOString().split('T')[0] : null,
        salary: parseFloat(values.salary),
        departmentId: values.departmentId || null,
        managerId: values.managerId || null,
      };

      console.log('Submitting employee data:', formattedValues);
      console.log('Is edit mode:', isEditMode);
      console.log('Employee ID:', id);

      if (isEditMode) {
        await employeeService.updateEmployee(id, formattedValues);
        showSnackbar('Employee updated successfully', 'success');
      } else {
        const response = await employeeService.createEmployee(formattedValues);
        showSnackbar(
          `Employee created successfully! A password setup email has been sent to ${formattedValues.email}`,
          'success'
        );
      }
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Error saving employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
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
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Employee' : 'Add Employee'}
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={EmployeeSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="firstName"
                    label="First Name"
                    fullWidth
                    error={touched.firstName && !!errors.firstName}
                    helperText={touched.firstName && errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    error={touched.lastName && !!errors.lastName}
                    helperText={touched.lastName && errors.lastName}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="phone"
                    label="Phone"
                    fullWidth
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="address"
                    label="Address"
                    fullWidth
                    multiline
                    rows={2}
                    error={touched.address && !!errors.address}
                    helperText={touched.address && errors.address}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="position"
                    label="Position"
                    fullWidth
                    error={touched.position && !!errors.position}
                    helperText={touched.position && errors.position}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    name="roleId"
                    label="Role"
                    fullWidth
                    error={touched.roleId && !!errors.roleId}
                    helperText={touched.roleId && errors.roleId}
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="salary"
                    label="Salary"
                    type="number"
                    fullWidth
                    error={touched.salary && !!errors.salary}
                    helperText={touched.salary && errors.salary}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    name="departmentId"
                    label="Department"
                    fullWidth
                    error={touched.departmentId && !!errors.departmentId}
                    helperText={touched.departmentId && errors.departmentId}
                  >
                    <MenuItem value="">None</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    name="managerId"
                    label="Manager"
                    fullWidth
                    error={touched.managerId && !!errors.managerId}
                    helperText={touched.managerId && errors.managerId}
                  >
                    <MenuItem value="">None</MenuItem>
                    {managers
                      .filter((manager) => manager.id !== id) // Exclude self from manager list
                      .map((manager) => (
                        <MenuItem key={manager.id} value={manager.id}>
                          {`${manager.firstName} ${manager.lastName}`}
                        </MenuItem>
                      ))}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Hire Date"
                      value={values.hireDate}
                      onChange={(date) => setFieldValue('hireDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.hireDate && !!errors.hireDate,
                          helperText: touched.hireDate && errors.hireDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    name="isActive"
                    label="Status"
                    fullWidth
                    error={touched.isActive && !!errors.isActive}
                    helperText={touched.isActive && errors.isActive}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Field>
                </Grid>
              </Grid>
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/employees')}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default EmployeeForm;
