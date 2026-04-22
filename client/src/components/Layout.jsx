import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { markAllNotificationsRead } from '../features/notifications/notificationSlice';

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationOpen = Boolean(notificationAnchorEl);
  const recentNotifications = notifications.slice(0, 8);

  const closeMenu = () => setMenuOpen(false);
  const openNotifications = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    if (unreadCount > 0) {
      dispatch(markAllNotificationsRead());
    }
  };
  const closeNotifications = () => setNotificationAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleProductsClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('categories-livestock');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/#categories-livestock', label: 'Products', onClick: handleProductsClick },
    { to: '/about', label: 'About' },
    ...(user?.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin' }] : [])
  ];

  return (
    <Box sx={{ overflowX: 'clip', width: '100%' }}>
      <AppBar position="sticky" color="transparent" sx={{ backdropFilter: 'blur(8px)' }}>
        <Toolbar sx={{ gap: 1.2, minHeight: { xs: 64, md: 72 } }}>
          <Typography variant="h5" component={Link} to="/" sx={{ textDecoration: 'none', color: '#11452e', fontWeight: 800 }}>
            Agromart
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
              {navLinks.map((link) => (
                <Button key={link.to} component={Link} to={link.to} color="inherit" onClick={link.onClick}>{link.label}</Button>
              ))}
            </Stack>
          )}

          <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: { xs: 0.2, sm: 0.8 } }}>
            <IconButton
              color="inherit"
              onClick={openNotifications}
              aria-label="open notifications"
            >
              <Badge badgeContent={unreadCount} color="error"><NotificationsIcon /></Badge>
            </IconButton>

            <Menu
              anchorEl={notificationAnchorEl}
              open={notificationOpen}
              onClose={closeNotifications}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 320, maxWidth: '92vw' } }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Notifications
                </Typography>
              </MenuItem>
              <Divider />
              {!recentNotifications.length && (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
                </MenuItem>
              )}
              {recentNotifications.map((notification) => (
                <MenuItem key={notification.id} onClick={closeNotifications} sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}>
                  <Stack spacing={0.3} sx={{ py: 0.4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {notification.message || 'Order update'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {notification.status || 'Pending'}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Menu>

            {!user && !isMobile && (
              <Button component={Link} to="/login" variant="contained" color="success">Login</Button>
            )}

            {user && !isMobile && (
              <Button onClick={handleLogout} variant="outlined" color="success">Logout</Button>
            )}

            {isMobile && (
              <IconButton color="inherit" onClick={() => setMenuOpen(true)} aria-label="open navigation menu">
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={menuOpen} onClose={closeMenu}>
        <Box sx={{ width: 280, p: 2 }} role="presentation">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Menu</Typography>
            <IconButton size="small" onClick={closeMenu} aria-label="close menu">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.to} component={Link} to={link.to} onClick={closeMenu}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}

            {!user && (
              <ListItemButton component={Link} to="/login" onClick={closeMenu}>
                <ListItemText primary="Login" />
              </ListItemButton>
            )}

            {user && (
              <ListItemButton
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, overflowX: 'clip' }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default Layout;
