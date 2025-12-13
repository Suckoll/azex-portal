import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const theme = createTheme({ palette: { primary: { main: '#1B5E20' } } });

const API_BASE = 'https://azex-backend-v2.onrender.com/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 33.4484, // Phoenix default
  lng: -112.0740
};

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
  const [tab, setTab] = useState(0);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [jobs, setJobs] = useState([]);

  const token = localStorage.getItem('jwt_token');

  const isAdmin = true; // Force admin view

  useEffect(() => {
    if (token && isAdmin) {
      axios.get(`${API_BASE}/technicians`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setTechnicians(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  useEffect(() => {
    if (selectedTech && token) {
      axios.get(`${API_BASE}/jobs/${selectedTech}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setJobs(res.data))
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
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Bug Reporting" />
            <Tab label="Payments" />
            <Tab label="Calendar" />
          </Tabs>
        </Paper>

        {tab === 5 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Technician Routes & Schedules
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Technician</InputLabel>
              <Select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}>
                <MenuItem value=""><em>None</em></MenuItem>
                {technicians.map(tech => (
                  <MenuItem key={tech.id} value={tech.id}>{tech.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTech && (
              <>
                <Typography variant="h6">Today's Jobs</Typography>
                <List>
                  {jobs.length === 0 ? (
                    <ListItem><ListItemText primary="No jobs scheduled today" /></ListItem>
                  ) : (
                    jobs.map(job => (
                      <ListItem key={job.id}>
                        <ListItemText primary={job.address} secondary={`${job.description} - ${job.status}`} />
                      </ListItem>
                    ))
                  )}
                </List>

                <Typography variant="h6" sx={{ mt: 3 }}>Route Map</Typography>
                <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                  <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={10}>
                    {jobs.map(job => (
                      <Marker key={job.id} position={{ lat: 33.4484, lng: -112.0740 }} title={job.address} />  // Replace with real coords later
                    ))}
                  </GoogleMap>
                </LoadScript>
              </>
            )}
          </Box>
        )}

        {/* Other tabs placeholder */}
        {tab === 0 && <Box><Typography variant="h5">Dashboard</Typography><Typography>Welcome!</Typography></Box>}
        {tab === 1 && <Box><Typography variant="h5">Invoices</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 2 && <Box><Typography variant="h5">Service History</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 3 && <Box><Typography variant="h5">Bug Reporting</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 4 && <Box><Typography variant="h5">Payments</Typography><Typography>Coming soon</Typography></Box>}
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