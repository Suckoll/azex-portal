import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Menu as MenuIcon, ReportProblem, Book, Diagram, Document, Condition, Message } from '@mui/icons-material'; // Icons like PestPac sidebar

const theme = createTheme({
  palette: {
    primary: { main: '#003366' }, // Navy blue like PestPac
    secondary: { main: '#008080' }, // Teal for buttons
  },
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Temporary demo login
    localStorage.setItem('jwt_token', 'demo');
    window.location.href = '/dashboard';
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img src="/logo.png" alt="AZEX Logo" style={{ maxWidth: '300px', height: 'auto' }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom color="#003366">
              AZEX PestGuard
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph>
              Customer Portal
            </Typography>
            <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
            <Button fullWidth variant="contained" color="secondary" onClick={handleLogin} sx={{ mt: 3 }}>
              Login
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

function Dashboard() {
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarItems = [
    { text: 'Reports', icon: <ReportProblem /> },
    { text: 'Log', icon: <Book /> },
    { text: 'Diagrams', icon: <Diagram /> },
    { text: 'Documents', icon: <Document /> },
    { text: 'Conditions', icon: <Condition /> },
    { text: 'Messages', icon: <Message /> },
  ];

  const logout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/';
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Button color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </Button>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="AZEX Logo" style={{ height: '40px', marginRight: '10px' }} />
            <Typography variant="h6">
              AZEX PestGuard Portal
            </Typography>
          </Box>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          {sidebarItems.map((item) => (
            <ListItemButton key={item.text}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
            <Tab label="Dashboard" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Bug Reporting" />
            <Tab label="Payments" />
            <Tab label="Customers" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom color="#003366">
              Welcome to Your AZEX Portal
            </Typography>
            <Typography paragraph>
              Your system is live! Use the sidebar and tabs to manage reports, logs, diagrams, and more.
            </Typography>
          </Box>
        )}

        {/* Placeholder for other tabs */}
        {tab === 1 && <Box><Typography variant="h5" color="#003366">Invoices</Typography><Typography>Invoice list and payments.</Typography></Box>}
        {tab === 2 && <Box><Typography variant="h5" color="#003366">Service History</Typography><Typography>View past services.</Typography></Box>}
        {tab === 3 && <Box><Typography variant="h5" color="#003366">Bug Reporting</Typography><Typography>Digital logbook form and open issues.</Typography></Box>}
        {tab === 4 && <Box><Typography variant="h5" color="#003366">Payments</Typography><Typography>Stripe payments.</Typography></Box>}
        {tab === 5 && <Box><Typography variant="h5" color="#003366">Customers</Typography><Typography>Manage customer accounts.</Typography></Box>}
      </Container>
    </>
  );
}

function App() {
  const token = localStorage.getItem('jwt_token');

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;