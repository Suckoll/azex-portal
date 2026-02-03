import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const theme = createTheme({ palette: { primary: { main: '#1B5E20' } } });

const API_BASE = 'https://azex-backend-v2.onrender.com/api';

const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

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
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
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
      axios.get(`${API_BASE}/branches`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setBranches(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const url = selectedBranch ? `${API_BASE}/customers?branch_id=${selectedBranch}` : `${API_BASE}/customers`;
      axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCustomers(res.data))
        .catch(err => console.error(err));
    }
  }, [token, selectedBranch]);

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

  const events = [
    {
      title: 'Monthly Service - Sunset Apartments',
      start: new Date(2025, 11, 22, 9, 0),
      end: new Date(2025, 11, 22, 12, 0),
    },
    {
      title: 'Emergency Call - Rob Suckoll',
      start: new Date(2025, 11, 23, 14, 0),
      end: new Date(2025, 11, 23, 16, 0),
    },
  ];

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
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Branch</InputLabel>
            <Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <MenuItem value="">
                <em>All Branches</em>
              </MenuItem>
              {branches.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.name} ({b.city}, {b.state})</MenuItem>
              ))}
            </Select>
          </FormControl>
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
            <Tab label="Employees" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Welcome to Your AZEX Portal
            </Typography>
            <Typography paragraph>
              Selected branch: {branches.find(b => b.id === selectedBranch)?.name || 'All Branches'}
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
            />
          </Box>
        )}

        {tab === 6 && (
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
                    {US_STATES.map(state => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Zip Code" value={newCustomer.zip} onChange={(e) => setNewCustomer({...newCustomer, zip: e.target.value})} />
                <FormControlLabel control={<Checkbox checked={newCustomer.multiUnit} onChange={(e) => setNewCustomer({...newCustomer, multiUnit: e.target.checked})} />} label="Multi-Unit Property" sx={{ gridColumn: 'span 2' }} />
              </Box>

              <Typography variant="h6">Bill To (if different)</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <TextField label="Bill To Name" value={newCustomer.billName} onChange={(e) => setNewCustomer({...newCustomer, billName: e.target.value})} />
                <TextField label="Bill To Email" value={newCustomer.billEmail} onChange={(e) => setNewCustomer({...newCustomer, billEmail: e.target.value})} />
                <TextField label="Bill To Phone" value={newCustomer.billPhone} onChange={(e) => setNewCustomer({...newCustomer, billPhone: e.target.value})} />
                <TextField label="Bill To Address" value={newCustomer.billAddress} onChange={(e) => setNewCustomer({...newCustomer, billAddress: e.target.value})} fullWidth sx={{ gridColumn: 'span 2' }} />
                <TextField label="Bill To City" value={newCustomer.billCity} onChange={(e) => setNewCustomer({...newCustomer, billCity: e.target.value})} />
                <FormControl>
                  <InputLabel>Bill To State</InputLabel>
                  <Select value={newCustomer.billState} onChange={(e) => setNewCustomer({...newCustomer, billState: e.target.value})}>
                    {US_STATES.map(state => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Bill To Zip" value={newCustomer.billZip} onChange={(e) => setNewCustomer({...newCustomer, billZip: e.target.value})} />
              </Box>

              <Button variant="contained" onClick={handleAddCustomer} sx={{ mt: 2 }}>
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
                  <TableCell>Multi-Unit</TableCell>
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
                      <TableCell>{c.firstName} {c.lastName}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone1}</TableCell>
                      <TableCell>{c.address}</TableCell>
                      <TableCell>{c.multiUnit ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Other tabs placeholder */}
        {tab === 0 && <Box><Typography variant="h5">Dashboard</Typography><Typography>Welcome!</Typography></Box>}
        {tab === 1 && <Box><Typography variant="h5">Calendar</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 2 && <Box><Typography variant="h5">Invoices</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 3 && <Box><Typography variant="h5">Service History</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 4 && <Box><Typography variant="h5">Bug Reporting</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 5 && <Box><Typography variant="h5">Payments</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 7 && <Box><Typography variant="h5">Employees</Typography><Typography>Coming soon</Typography></Box>}
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