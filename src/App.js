import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

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
              <img src="/logo.png" alt="AZEX Logo" style={{ maxWidth: '300px', height: 'auto' }} />
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
  const [tab, setTab] = useState(1); // Start on Calendar
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [events, setEvents] = useState([]);

  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/technicians`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setTechnicians(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  useEffect(() => {
    if (selectedTech && token) {
      axios.get(`${API_BASE}/jobs/${selectedTech}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const formatted = res.data.map(job => ({
            id: job.id,
            title: job.title,
            start: new Date(job.start),
            end: new Date(job.end),
            description: job.description
          }));
          setEvents(formatted);
        })
        .catch(err => console.error(err));
    }
  }, [selectedTech, token]);

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
            <Tab label="Calendar" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Bug Reporting" />
            <Tab label="Payments" />
            <Tab label="Customers" />
          </Tabs>
        </Paper>

        {tab === 1 && (
          <Box>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Technician</InputLabel>
              <Select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
                <MenuItem value="">
                  <em>All Technicians</em>
                </MenuItem>
                {technicians.map(tech => (
                  <MenuItem key={tech.id} value={tech.id}>{tech.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
              />
            </Box>
          </Box>
        )}

        {/* Other tabs placeholder */}
        {tab === 0 && <Box><Typography variant="h5">Dashboard</Typography><Typography>Welcome!</Typography></Box>}
        {tab === 2 && <Box><Typography variant="h5">Invoices</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 3 && <Box><Typography variant="h5">Service History</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 4 && <Box><Typography variant="h5">Bug Reporting</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 5 && <Box><Typography variant="h5">Payments</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 6 && <Box><Typography variant="h5">Customers</Typography><Typography>Coming soon</Typography></Box>}
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