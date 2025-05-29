import { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  EventNote as EventNoteIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Layout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, hasPermission } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      permission: 'employees:read',
    },
    {
      text: 'Employees',
      icon: <PeopleIcon />,
      path: '/employees',
      permission: 'employees:read',
    },
    {
      text: 'Departments',
      icon: <BusinessIcon />,
      path: '/departments',
      permission: 'departments:read',
    },
    {
      text: 'Roles',
      icon: <SecurityIcon />,
      path: '/roles',
      permission: 'roles:read',
    },
    {
      text: 'Leave Requests',
      icon: <EventNoteIcon />,
      path: '/leaves',
      permission: 'leaves:read',
    },
    {
      text: 'Attendance',
      icon: <AssignmentTurnedInIcon />,
      path: '/attendance',
      permission: 'attendance:read',
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <AppBarStyled
        position="fixed"
        open={open}
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: `1px solid ${theme.palette.grey[200]}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: 'none' }),
              color: theme.palette.primary.main,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              EMS
            </Box>
            <Box>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  fontSize: '1.25rem',
                }}
              >
                Employee Management System
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                Professional HR Management Platform
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={user?.role || 'User'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{
                p: 0,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              <UserAvatar
                user={user}
                employee={user?.employee}
                size={40}
                sx={{
                  fontWeight: 600,
                }}
              />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: `1px solid ${theme.palette.grey[200]}`,
                  minWidth: 180,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.username || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'user@company.com'}
                </Typography>
              </Box>
              <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: `1px solid ${theme.palette.grey[200]}`,
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader sx={{
          px: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${theme.palette.grey[200]}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h6" color="primary" fontWeight={600}>
              Navigation
            </Typography>
          </Box>
          <IconButton
            onClick={handleDrawerClose}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>

        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => (
            (hasPermission(item.permission.split(':')[0], item.permission.split(':')[1]) || !item.permission) && (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: location.pathname === item.path
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: `1px solid ${theme.palette.grey[200]}` }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Version 1.0.0
            </Typography>
            <Typography variant="caption" color="text.secondary">
              © 2024 EMS Platform
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Main
        open={open}
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <DrawerHeader />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
};

export default Layout;
