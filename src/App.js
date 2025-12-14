import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow, List, ListItem, ListItemText, IconButton, Input } from '@mui/material';
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
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', phone: '', email: '', address: '' });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('jwt_token');

  const isAdmin = true; // Force admin view

  useEffect(() => {
    if (token) {
      if (isAdmin) {
        axios.get(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => setCustomers(res.data));
        axios.get(`${API_BASE}/invoices`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => setInvoices(res.data));
      }
      axios.get(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setServices(res.data));
      axios.get(`${API_BASE}/bugs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setBugs(res.data));
    }
  }, [token]);

  const handleAddCustomer = async () => {
    try {
      await axios.post(`${API_BASE}/customers`, newCustomer, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Customer added!');
      setNewCustomer({ firstName: '', lastName: '', phone: '', email: '', address: '' });
      const res = await axios.get(`${API_BASE}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      setCustomers(res.data);
    } catch (err) {
      setMessage('Failed to add customer');
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
            {isAdmin && <Tab label="Customers" />}
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
            <List>
              {invoices.map(inv => (
                <ListItem key={inv.id}>
                  <ListItemText primary={`$${inv.amount} - ${inv.description}`} secondary={`Status: ${inv.status}`} />
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
              Bug Reporting
            </Typography>
            <List>
              {bugs.map(b => (
                <ListItem key={b.id}>
                  <ListItemText primary={b.unit + ' - ' + b.pest} secondary={b.description} />
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
              Stripe payments coming soon.
            </Typography>
          </Box>
        )}

        {tab === 5 && isAdmin && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Manage Customers
            </Typography>
            <Box sx={{ mb: 4 }}>
              <TextField label="First Name" value={newCustomer.firstName} onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})} fullWidth margin="normal" />
              <TextField label="Last Name" value={newCustomer.lastName} onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})} fullWidth margin="normal" />
              <TextField label="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} fullWidth margin="normal" />
              <TextField label="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} fullWidth margin="normal" />
              <TextField label="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} fullWidth margin="normal" />
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
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.firstName} {c.lastName}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.address}</TableCell>
                  </TableRow>
                ))}
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