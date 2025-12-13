import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, List, ListItem, ListItemText, IconButton, Input } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const theme = createTheme({ palette: { primary: { main: '#1B5E20' } } });

// Change this to your Render backend URL
const API_BASE = 'https://azex-backend-v2.onrender.com/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Demo login for now (replace with real axios when backend ready)
    localStorage.setItem('jwt_token', 'demo-token');
    window.location.href = '/dashboard';
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img src="/logo.png" alt="AZEX Pest Solutions Logo" style={{ maxWidth: '300px', height: 'auto' }} />
            </Box>
            <Typography variant="h4" align="center" gutterBottom>
              AZEX PestGuard
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph>
              Customer Portal
            </Typography>
            <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
            <Button fullWidth variant="contained" onClick={handleLogin} sx={{ mt: 3 }}>
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
  const [bugDescription, setBugDescription] = useState('');
  const [bugPhoto, setBugPhoto] = useState(null);
  const [bugMessage, setBugMessage] = useState('');

  const logout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/';
  };

  const handleBugReport = () => {
    setBugMessage('Bug reported successfully! (demo)');
    setBugDescription('');
    setBugPhoto(null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="AZEX Logo" style={{ height: '40px', marginRight: '10px' }} />
            <Typography variant="h6">
              AZEX PestGuard Portal
            </Typography>
          </Box>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
            <Tab label="Dashboard" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Bug Reporting" />
            <Tab label="Payments" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Welcome to Your AZEX Portal
            </Typography>
            <Typography paragraph>
              Your system is live! Use the tabs to manage everything.
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Invoices
            </Typography>
            <Typography paragraph>
              Your invoice list will appear here.
            </Typography>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Service History
            </Typography>
            <Typography paragraph>
              View all past services and treatments.
            </Typography>
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Report a Bug
            </Typography>
            <TextField fullWidth label="Description" value={bugDescription} onChange={(e) => setBugDescription(e.target.value)} multiline rows={4} margin="normal" />
            <Input accept="image/*" type="file" onChange={(e) => setBugPhoto(e.target.files[0])} />
            <IconButton color="primary" component="label">
              <PhotoCamera />
            </IconButton>
            <Button variant="contained" onClick={handleBugReport} sx={{ mt: 2 }}>
              Submit Report
            </Button>
            {bugMessage && <Alert severity="success" sx={{ mt: 2 }}>{bugMessage}</Alert>}
          </Box>
        )}

        {tab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Payments
            </Typography>
            <Typography paragraph>
              Secure Stripe payments coming soon.
            </Typography>
          </Box>
        )}
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