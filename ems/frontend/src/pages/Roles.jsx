import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useSnackbar } from '../contexts/SnackbarContext';
import roleService from '../services/roleService';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      employees: [],
      departments: [],
      roles: [],
      attendance: [],
      leaves: []
    }
  });

  const { showSnackbar } = useSnackbar();

  const permissionOptions = {
    employees: ['create', 'read', 'update', 'delete'],
    departments: ['create', 'read', 'update', 'delete'],
    roles: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'delete'],
    leaves: ['create', 'read', 'update', 'delete']
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAllRoles();
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showSnackbar('Error fetching roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || {
          employees: [],
          departments: [],
          roles: [],
          attendance: [],
          leaves: []
        }
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: {
          employees: [],
          departments: [],
          roles: [],
          attendance: [],
          leaves: []
        }
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (module, permission, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked
          ? [...prev.permissions[module], permission]
          : prev.permissions[module].filter(p => p !== permission)
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, formData);
        showSnackbar('Role updated successfully', 'success');
      } else {
        await roleService.createRole(formData);
        showSnackbar('Role created successfully', 'success');
      }

      fetchRoles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving role:', error);
      showSnackbar(error.response?.data?.message || 'Error saving role', 'error');
    }
  };

  const handleDelete = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        await roleService.deleteRole(roleId);
        showSnackbar('Role deleted successfully', 'success');
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        showSnackbar(error.response?.data?.message || 'Error deleting role', 'error');
      }
    }
  };

  const getPermissionChips = (permissions) => {
    if (!permissions) return null;

    const allPermissions = [];
    Object.entries(permissions).forEach(([module, perms]) => {
      if (Array.isArray(perms)) {
        perms.forEach(perm => {
          allPermissions.push(`${module}:${perm}`);
        });
      }
    });

    return allPermissions.slice(0, 3).map((perm, index) => (
      <Chip
        key={index}
        label={perm}
        size="small"
        variant="outlined"
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    ));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
                <SecurityIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="700" sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Role Management
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight="400">
                  Define and manage user roles and permissions
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={`${roles.length} Roles`}
                color="primary"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem'
                }}
              />
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
                Add Role
              </Button>
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
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Role Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Permissions</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Users Count</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Actions</TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow
                key={role.id}
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
                  <Typography variant="subtitle2" fontWeight="bold">
                    {role.name}
                  </Typography>
                </TableCell>
                <TableCell>{role.description || 'No description'}</TableCell>
                <TableCell>
                  <Box>
                    {getPermissionChips(role.permissions)}
                    {role.permissions && Object.values(role.permissions).flat().length > 3 && (
                      <Chip
                        label={`+${Object.values(role.permissions).flat().length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={role.userCount || 0}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title="Edit Role">
                      <IconButton
                        onClick={() => handleOpenDialog(role)}
                        color="primary"
                        size="small"
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
                    <Tooltip title={role.name === 'Admin' ? 'Cannot delete Admin role' : 'Delete Role'}>
                      <span>
                        <IconButton
                          onClick={() => handleDelete(role.id, role.name)}
                          color="error"
                          size="small"
                          disabled={role.name === 'Admin'}
                          sx={{
                            backgroundColor: `${theme.palette.error.main}15`,
                            '&:hover': {
                              backgroundColor: `${theme.palette.error.main}25`,
                              transform: 'scale(1.1)',
                            },
                            '&:disabled': {
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>

      {/* Role Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Add New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Role Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Permissions
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select the permissions this role should have for each module.
                </Alert>

                {Object.entries(permissionOptions).map(([module, permissions]) => (
                  <Box key={module} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </Typography>
                    <FormGroup row>
                      {permissions.map((permission) => (
                        <FormControlLabel
                          key={permission}
                          control={
                            <Checkbox
                              checked={formData.permissions[module]?.includes(permission) || false}
                              onChange={(e) => handlePermissionChange(module, permission, e.target.checked)}
                            />
                          }
                          label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;
