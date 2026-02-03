import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert,
  Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [selectedBranch, setSelectedBranch] = useState(''); // '' = all, number = specific branch ID
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null); // null = none selected, number = tech ID
  const [events, setEvents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const initialNewCustomer = {
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
  };

  const [newCustomer, setNewCustomer] = useState(initialNewCustomer);

  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/branches`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setBranches(res.data))
        .catch(err => console.error(err));

      axios.get(`${API_BASE}/technicians`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setTechnicians(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedTech !== null) {
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
    } else {
      setEvents([]);
    }
  }, [token, selectedTech]);

  useEffect(() => {
    if (token) {
      const url = selectedBranch !== '' ? `${API_BASE}/customers?branch_id=${selectedBranch}` : `${API_BASE}/customers`;
      axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCustomers(res.data))
        .catch(err => console.error(err));
    }
  }, [token, selectedBranch]);

  const handleSaveCustomer = async () => {
    if (!editingId && selectedBranch === '') {
      setMessage('Please select a branch to add the customer to.');
      return;
    }

    try {
      let customerData = { ...newCustomer };
      if (!editingId) {
        customerData.branch_id = selectedBranch;
      }

      if (editingId) {
        await axios.put(`${API_BASE}/customers/${editingId}`, customerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Customer updated successfully!');
      } else {
        await axios.post(`${API_BASE}/customers`, customerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Customer added successfully!');
      }

      setEditingId(null);
      setNewCustomer(initialNewCustomer);

      const fetchUrl = selectedBranch !== '' ? `${API_BASE}/customers?branch_id=${selectedBranch}` : `${API_BASE}/customers`;
      const res = await axios.get(fetchUrl, { headers: { Authorization: `Bearer ${token}` } });
      setCustomers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`${API_BASE}/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Customer deleted successfully!');

        const fetchUrl = selectedBranch !== '' ? `${API_BASE}/customers?branch_id=${selectedBranch}` : `${API_BASE}/customers`;
        const res = await axios.get(fetchUrl, { headers: { Authorization: `Bearer ${token}` } });
        setCustomers(res.data);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/';
  };

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.firstName || '').toLowerCase().includes(term) ||
      (c.lastName || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone1 || '').toLowerCase().includes(term) ||
      (c.company || '').toLowerCase().includes(term)
    );
  });

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
            <Select
              value={selectedBranch ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBranch(val === '' ? '' : Number(val));
              }}
            >
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
            <Tab label="Digital Logbook" />
            <Tab label="Payments" />
            <Tab label="Customers" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Welcome to AZEX PestGuard Portal</Typography>
            <Typography paragraph>
              Selected Branch: {selectedBranch === '' ? 'All Branches' : branches.find(b => b.id === selectedBranch)?.name || 'Unknown Branch'}
            </Typography>
            <Typography>Technicians: {technicians.length}</Typography>
            <Typography>
              Customers: {customers.length} {selectedBranch === '' ? '(across all branches)' : '(this branch only)'}
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Technician</InputLabel>
              <Select
                value={selectedTech ?? ''}
                onChange={(e) => setSelectedTech(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="" disabled>
                  <em>Select a technician</em>
                </MenuItem>
                {technicians.map(tech => (
                  <MenuItem key={tech.id} value={tech.id}>{tech.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTech === null ? (
              <Alert severity="info">Please select a technician to view their schedule.</Alert>
            ) : (
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
          </Box>
        )}

        {(tab === 2 || tab === 3 || tab === 4 || tab === 5) && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h5">
              {['', '', 'Invoices', 'Service History', 'Digital Logbook', 'Payments'][tab]}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              This feature is coming soon.
            </Typography>
          </Box>
        )}

        {tab === 6 && (
          <Box>
            <Typography variant="h5" gutterBottom>Manage Customers</Typography>

            {selectedBranch !== '' ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Current branch: {branches.find(b => b.id === selectedBranch)?.name || 'Unknown'}
              </Alert>
            ) : editingId ? null : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Select a branch to add new customers (editing existing customers is still available).
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <TextField label="First Name" value={newCustomer.firstName} onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })} />
              <TextField label="Last Name" value={newCustomer.lastName} onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })} />
              <TextField label="Phone" value={newCustomer.phone1} onChange={(e) => setNewCustomer({ ...newCustomer, phone1: e.target.value })} />
              <TextField label="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
              <TextField label="Company Name" value={newCustomer.company} onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })} />
              <TextField label="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} fullWidth sx={{ gridColumn: 'span 2' }} />
              <TextField label="City" value={newCustomer.city} onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })} />
              <FormControl>
                <InputLabel>State</InputLabel>
                <Select value={newCustomer.state} onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}>
                  {US_STATES.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Zip Code" value={newCustomer.zip} onChange={(e) => setNewCustomer({ ...newCustomer, zip: e.target.value })} />
              <FormControlLabel
                control={<Checkbox checked={newCustomer.multiUnit} onChange={(e) => setNewCustomer({ ...newCustomer, multiUnit: e.target.checked })} />}
                label="Multi-Unit Property"
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>

            <Typography variant="h6" gutterBottom>Bill To (if different)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <TextField label="Bill To Name" value={newCustomer.billName} onChange={(e) => setNewCustomer({ ...newCustomer, billName: e.target.value })} />
              <TextField label="Bill To Email" value={newCustomer.billEmail} onChange={(e) => setNewCustomer({ ...newCustomer, billEmail: e.target.value })} />
              <TextField label="Bill To Phone" value={newCustomer.billPhone} onChange={(e) => setNewCustomer({ ...newCustomer, billPhone: e.target.value })} />
              <TextField label="Bill To Address" value={newCustomer.billAddress} onChange={(e) => setNewCustomer({ ...newCustomer, billAddress: e.target.value })} fullWidth sx={{ gridColumn: 'span 2' }} />
              <TextField label="Bill To City" value={newCustomer.billCity} onChange={(e) => setNewCustomer({ ...newCustomer, billCity: e.target.value })} />
              <FormControl>
                <InputLabel>Bill To State</InputLabel>
                <Select value={newCustomer.billState} onChange={(e) => setNewCustomer({ ...newCustomer, billState: e.target.value })}>
                  {US_STATES.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Bill To Zip" value={newCustomer.billZip} onChange={(e) => setNewCustomer({ ...newCustomer, billZip: e.target.value })} />
            </Box>

            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSaveCustomer}
                disabled={selectedBranch === '' && !editingId}
              >
                {editingId ? 'Update Customer' : 'Add Customer'}
              </Button>
              {editingId && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingId(null);
                    setNewCustomer(initialNewCustomer);
                    setMessage('');
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </Box>

            {message && (
              <Alert severity={message.includes('success') ? 'success' : message.includes('select a branch') ? 'warning' : 'error'} sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}

            <TextField
              fullWidth
              placeholder="Search by name, email, phone, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Multi-Unit</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {customers.length === 0 ? 'No customers yet — add one above!' : 'No customers match your search.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.firstName} {c.lastName}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone1}</TableCell>
                      <TableCell>{c.address}</TableCell>
                      <TableCell>{c.multiUnit ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setNewCustomer({
                              ...initialNewCustomer,
                              ...c,
                              multiUnit: !!c.multiUnit
                            });
                            setEditingId(c.id);
                          }}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
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