import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert, Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
  const [tab, setTab] = useState(0);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    branch_id: ''
  });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/branches`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setBranches(res.data))
        .catch(err => console.error(err));
      axios.get(`${API_BASE}/employees`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setEmployees(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  const handleAddEmployee = async () => {
    try {
      await axios.post(`${API_BASE}/employees`, newEmployee, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Employee added successfully!');
      setNewEmployee({ name: '', email: '', phone: '', branch_id: '' });
      const res = await axios.get(`${API_BASE}/employees`, { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add employee');
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
            <Tab label="Calendar" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Bug Reporting" />
            <Tab label="Payments" />
            <Tab label="Customers" />
            <Tab label="Employees" />
          </Tabs>
        </Paper>

        {tab === 7 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Manage Employees
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Add New Employee</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <TextField label="Name" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} />
                <TextField label="Email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} />
                <TextField label="Phone" value={newEmployee.phone} onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})} />
                <FormControl>
                  <InputLabel>Branch</InputLabel>
                  <Select value={newEmployee.branch_id} onChange={(e) => setNewEmployee({...newEmployee, branch_id: e.target.value})}>
                    {branches.map(b => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Button variant="contained" onClick={handleAddEmployee} sx={{ mt: 2 }}>
                Add Employee
              </Button>
              {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>{message}</Alert>}
            </Box>

            <Typography variant="h6">Current Employees</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Branch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No employees yet — add one above!</TableCell>
                  </TableRow>
                ) : (
                  employees.map(e => (
                    <TableRow key={e.id}>
                      <TableCell>{e.name}</TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>{e.phone || 'N/A'}</TableCell>
                      <TableCell>{branches.find(b => b.id === e.branch_id)?.name || 'N/A'}</TableCell>
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