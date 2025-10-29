import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { AppBar, Box, Toolbar, Typography, IconButton, Container, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import CalculateIcon from '@mui/icons-material/Calculate';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Link from 'next/link';
import { ColorModeContext } from '../pages/_app.js';

export default function Layout({ children }) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Home', href: '/', icon: <HomeIcon /> },
    { text: 'Script-Timer', href: '/tools/script-timer', icon: <TimerIcon /> },
    { text: 'VAT Calculator', href: '/tools/vat-calculator', icon: <CalculateIcon /> },
    { text: 'Print Resolution Checker', href: '/tools/resolution-checker', icon: <ImageSearchIcon /> },
    { text: 'QR Code Generator', href: '/tools/qr-code-generator', icon: <QrCode2Icon /> },
  ];

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item) => (
          <Link href={item.href} passHref key={item.text}>
            <ListItem disablePadding component="a">
              <ListItemButton>
                                  <ListItemIcon sx={{ color: 'text.primary' }}>{item.icon}</ListItemIcon>
                                  <ListItemText primary={item.text} sx={{ color: 'text.primary' }} />              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" component="div" sx={{ cursor: 'pointer' }}>
              Toolist
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            top: 64, // AppBar height
            height: 'calc(100% - 64px)',
          },
        }}
      >
        {drawerList}
      </Drawer>
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
      {/* Footer with version */}
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          Toolist v1.2.0
        </Typography>
      </Box>
    </Box>
  );
}