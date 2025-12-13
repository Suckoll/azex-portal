import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Input } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';

const theme = createTheme({ palette: { primary: { main: '#1B5E20' } } });

const API_BASE = 'https://azex-backend-v2.onrender.com/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      localStorage.setItem('jwt_token', res.data.access_token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
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
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);

  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/invoices`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setInvoices(res.data))
        .catch(err => console.error(err));
      axios.get(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setServices(res.data))
        .catch(err => console.error(err));
      axios.get(`${API_BASE}/bugs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setBugs(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  const handleBugReport = async () => {
    const formData = new FormData();
    formData.append('description', description);
    if (photo) formData.append('photo', photo);

    await axios.post(`${API_BASE}/bugs`, formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    });
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/';
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
              Your pest control management system is live and ready.
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Invoices
            </Typography>
            <List>
              {invoices.map(inv => (
                <ListItem key={inv.id}>
                  <ListItemText primary={`$${inv.amount} - ${inv.description}`} secondary={inv.date} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Service History
            </Typography>
            <List>
              {services.map(s => (
                <ListItem key={s.id}>
                  <ListItemText primary={s.description} secondary={s.date} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Report a Bug
            </Typography>
            <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={4} margin="normal" />
            <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
            <Button variant="contained" onClick={handleBugReport} sx={{ mt: 2 }}>
              Submit Report
            </Button>
            <Typography variant="h6" sx={{ mt: 4 }}>Previous Reports</Typography>
            <List>
              {bugs.map(b => (
                <ListItem key={b.id}>
                  <ListItemAvatar>
                    {b.photo && <Avatar src={`${API_BASE.replace('/api', '')}/uploads/${b.photo}`} />}
                  </ListItemAvatar>
                  <ListItemText primary={b.description} secondary={b.date} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Payments
            </Typography>
            <Typography paragraph>
              Secure Stripe payments coming soon — pay invoices directly in the portal.
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