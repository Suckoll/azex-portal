import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
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
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone1: '',
    email: '',
    company: '',
    address: '',
    city: '',
    state: 'AZ',
    zip: '',
    propertyType: 'Single Unit',
    source: '',
    sms: true,
    emailPref: true,
    voice: false,
    flags: []
  });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('jwt_token');

  const isAdmin = true;  // Force admin view

  useEffect(() => {
    if (token && isAdmin) {
      axios.get(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCustomers(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  const handleAddCustomer = async () => {
    try {
      await axios.post(`${API_BASE}/customers`, newCustomer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Customer added successfully!');
      setNewCustomer({
        firstName: '',
        lastName: '',
        phone1: '',
        email: '',
        company: '',
        address: '',
        city: '',
        state: 'AZ',
        zip: '',
        propertyType: 'Single Unit',
        source: '',
        sms: true,
        emailPref: true,
        voice: false,
        flags: []
      });
      const res = await axios.get(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      setCustomers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add customer');
    }
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
            <Tab label="Customers" />
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

        {tab === 5 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Manage Customers
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Create a New Customer</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="First Name" value={newCustomer.firstName} onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})} />
                <TextField label="Last Name" value={newCustomer.lastName} onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})} />
                <TextField label="Phone 1" value={newCustomer.phone1} onChange={(e) => setNewCustomer({...newCustomer, phone1: e.target.value})} />
                <TextField label="Email Address" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} />
                <TextField label="Company Name" value={newCustomer.company} onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})} />
                <TextField label="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} />
                <TextField label="City" value={newCustomer.city} onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})} />
                <FormControl>
                  <InputLabel>State</InputLabel>
                  <Select value={newCustomer.state} onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}>
                    <MenuItem value="AZ">AZ</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Zip Code" value={newCustomer.zip} onChange={(e) => setNewCustomer({...newCustomer, zip: e.target.value})} />
                <FormControl>
                  <InputLabel>Residential Property</InputLabel>
                  <Select value={newCustomer.propertyType} onChange={(e) => setNewCustomer({...newCustomer, propertyType: e.target.value})}>
                    <MenuItem value="Single Unit">Single Unit</MenuItem>
                    <MenuItem value="Multi-Unit">Multi-Unit</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Communication Preferences</Typography>
                <FormControlLabel control={<Checkbox checked={newCustomer.sms} onChange={(e) => setNewCustomer({...newCustomer, sms: e.target.checked})} />} label="SMS" />
                <FormControlLabel control={<Checkbox checked={newCustomer.emailPref} onChange={(e) => setNewCustomer({...newCustomer, emailPref: e.target.checked})} />} label="Email" />
                <FormControlLabel control={<Checkbox checked={newCustomer.voice} onChange={(e) => setNewCustomer({...newCustomer, voice: e.target.checked})} />} label="Voice" />
              </Box>
              <Button variant="contained" onClick={handleAddCustomer} sx={{ mt: 3 }}>
                Add Customer
              </Button>
              {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>{message}</Alert>}
            </Box>

            <Typography variant="h6">Current Customers</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Property Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No customers yet — add one above!</TableCell>
                  </TableRow>
                ) : (
                  customers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name || 'N/A'}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone || 'N/A'}</TableCell>
                      <TableCell>{c.address || 'N/A'}</TableCell>
                      <TableCell>{c.propertyType || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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