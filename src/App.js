import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
    billName: '',
    billEmail: '',
    billPhone: '',
    billAddress: '',
    billCity: '',
    billState: 'AZ',
    billZip: '',
    multiUnit: false
  });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    if (token) {
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
        billName: '',
        billEmail: '',
        billPhone: '',
        billAddress: '',
        billCity: '',
        billState: 'AZ',
        billZip: '',
        multiUnit: false
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
              <Typography variant="h6">Basic Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <TextField label="First Name" value={newCustomer.firstName} onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})} />
                <TextField label="Last Name" value={newCustomer.lastName} onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})} />
                <TextField label="Phone" value={newCustomer.phone1} onChange={(e) => setNewCustomer({...newCustomer, phone1: e.target.value})} />
                <TextField label="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} />
                <TextField label="Company Name" value={newCustomer.company} onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})} />
                <TextField label="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} fullWidth sx={{ gridColumn: 'span 2' }} />
                <TextField label="City" value={newCustomer.city} onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})} />
                <FormControl>
                  <InputLabel>State</InputLabel>
                  <Select value={newCustomer.state} onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}>
                    <MenuItem value="AL">AL</MenuItem>
                    <MenuItem value="AK">AK</MenuItem>
                    <MenuItem value="AZ">AZ</MenuItem>
                    <MenuItem value="AR">AR</MenuItem>
                    <MenuItem value="CA">CA</MenuItem>
                    <MenuItem value="CO">CO</MenuItem>
                    <MenuItem value="CT">CT</MenuItem>
                    <MenuItem value="DE">DE</MenuItem>
                    <MenuItem value="FL">FL</MenuItem>
                    <MenuItem value="GA">GA</MenuItem>
                    <MenuItem value="HI">HI</MenuItem>
                    <MenuItem value="ID">ID</MenuItem>
                    <MenuItem value="IL">IL</MenuItem>
                    <MenuItem value="IN">IN</MenuItem>
                    <MenuItem value="IA">IA</MenuItem>
                    <MenuItem value="KS">KS</MenuItem>
                    <MenuItem value="KY">KY</MenuItem>
                    <MenuItem value="LA">LA</MenuItem>
                    <MenuItem value="ME">ME</MenuItem>
                    <MenuItem value="MD">MD</MenuItem>
                    <MenuItem value="MA">MA</MenuItem>
                    <MenuItem value="MI">MI</MenuItem>
                    <MenuItem value="MN">MN</MenuItem>
                    <MenuItem value="MS">MS</MenuItem>
                    <MenuItem value="MO">MO</MenuItem>
                    <MenuItem value="MT">MT</MenuItem>
                    <MenuItem value="NE">NE</MenuItem>
                    <MenuItem value="NV">NV</MenuItem>
                    <MenuItem value="NH">NH</MenuItem>
                    <MenuItem value="NJ">NJ</MenuItem>
                    <MenuItem value="NM">NM</MenuItem>
                    <MenuItem value="NY">NY</MenuItem>
                    <MenuItem value="NC">NC</MenuItem>
                    <MenuItem value="ND">ND</MenuItem>
                    <MenuItem value="OH">OH</MenuItem>
                    <MenuItem value="OK">OK</MenuItem>
                    <MenuItem value="OR">OR</MenuItem>
                    <MenuItem value="PA">PA</MenuItem>
                    <MenuItem value="RI">RI</MenuItem>
                    <MenuItem value="SC">SC</MenuItem>
                    <MenuItem value="SD">SD</MenuItem>
                    <MenuItem value="TN">TN</MenuItem>
                    <MenuItem value="TX">TX</MenuItem>
                    <MenuItem value="UT">UT</MenuItem>
                    <MenuItem value="VT">VT</MenuItem>
                    <MenuItem value="VA">VA</MenuItem>
                    <MenuItem value="WA">WA</MenuItem>
                    <MenuItem value="WV">WV</MenuItem>
                    <MenuItem value="WI">WI</MenuItem>
                    <MenuItem value="WY">WY</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Zip Code" value={newCustomer.zip} onChange={(e) => setNewCustomer({...newCustomer, zip: e.target.value})} />
                <FormControlLabel control={<Checkbox checked={newCustomer.multiUnit} onChange={(e) => setNewCustomer({...newCustomer, multiUnit: e.target.checked})} />} label="Multi-Unit Property" sx={{ gridColumn: 'span 2' }} />
              </Box>

              <Typography variant="h6">Bill To (if different)</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <TextField label="Bill To Name" value={newCustomer.billName} onChange={(e) => setNewCustomer({...newCustomer, billName: e.target.value})} />
                <TextField label="Bill To Email" value={newCustomer.billEmail} onChange={(e) => setNewCustomer({...newCustomer, billEmail: e