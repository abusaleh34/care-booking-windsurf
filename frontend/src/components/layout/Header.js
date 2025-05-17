import React, { useState, useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Badge
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation();
  
  // Use the authentication context
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            {t('common.appName')}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={Link}
              to="/services"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              {t('navigation.services')}
            </Button>
            <Button
              component={Link}
              to="/booking"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              {t('navigation.bookNow')}
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  component={Link}
                  to="/dashboard"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {t('navigation.dashboard')}
                </Button>
                <Button
                  component={Link}
                  to="/chats"
                  sx={{ my: 2, color: 'white', display: 'flex', alignItems: 'center' }}
                  startIcon={
                    <Badge color="error" badgeContent={0} showZero={false}>
                      <ChatIcon />
                    </Badge>
                  }
                >
                  {t('navigation.messages')}
                </Button>
              </>
            )}
          </Box>

          {/* Language Selector */}
          <LanguageSelector />
          
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32 }} />
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
                >
                  <MenuItem 
                    onClick={() => {
                      handleClose();
                      navigate('/profile');
                    }}
                  >
                    {t('profile.title')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate('/dashboard');
                    }}
                  >
                    {t('navigation.dashboard')}
                  </MenuItem>
                  <MenuItem component={Link} to="/chats" onClick={handleClose}>
                    {t('navigation.messages')}
                  </MenuItem>
                  <MenuItem component={Link} to="/bookings/me" onClick={handleClose}>
                    {t('dashboard.myBookings')}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>{t('auth.logout')}</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                >
                  {t('auth.login')}
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  color="inherit"
                  variant="outlined"
                  sx={{ ml: 1, borderColor: 'white' }}
                >
                  {t('auth.register')}
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
