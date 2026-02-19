import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert,
  Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, IconButton,
  useMediaQuery, useTheme
} from '@mui/material';
import axios from 'axios';
import moment from 'moment';

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
              AZEX Customer Management System
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph>
              Admin Login
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
  const themeHook = useTheme();
  const isMobile = useMediaQuery(themeHook.breakpoints.down('sm'));

  const [tab, setTab] = useState(0);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('jwt_token');
  const headers = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/branches`, headers)
        .then(res => {
          setBranches(res.data);
          if (res.data.length > 0 && selectedBranch === '') {
            setSelectedBranch(res.data[0].id);
          }
        })
        .catch(() => setMessage('Failed to load branches'));
    }
  }, [token, headers, selectedBranch]);

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
              AZEX Customer Management System
            </Typography>
          </Box>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered variant={isMobile ? 'scrollable' : 'standard'}>
            <Tab label="Dashboard" />
            <Tab label="Calendar" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Digital Logbook" />
            <Tab label="Payments" />
            <Tab label="Customers" />
            <Tab label="Administration" />
            <Tab label="Inventory" />
          </Tabs>
        </Paper>

        {/* Dashboard */}
        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Welcome to AZEX Customer Management System</Typography>
            <Typography paragraph>
              Selected Branch: {selectedBranch === '' ? 'Loading...' : branches.find(b => b.id === selectedBranch)?.name || 'None'}
            </Typography>
          </Box>
        )}

        {/* Calendar */}
        {tab === 1 && (
          <Box>
            <Typography variant="h5">Calendar</Typography>
            <Typography>Calendar feature coming soon...</Typography>
          </Box>
        )}

        {/* Invoices */}
        {tab === 2 && (
          <Box>
            <Typography variant="h5">Invoices</Typography>
            <Typography>Invoices feature coming soon...</Typography>
          </Box>
        )}

        {/* Service History */}
        {tab === 3 && (
          <Box>
            <Typography variant="h5">Service History</Typography>
            <Typography>Service History feature coming soon...</Typography>
          </Box>
        )}

        {/* Digital Logbook - Your full component */}
        {tab === 4 && <DigitalLogbook />}

        {/* Payments */}
        {tab === 5 && (
          <Box>
            <Typography variant="h5">Payments</Typography>
            <Typography>Payments feature coming soon...</Typography>
          </Box>
        )}

        {/* Customers */}
        {tab === 6 && (
          <Box>
            <Typography variant="h5">Customers</Typography>
            <Typography>Customers feature coming soon...</Typography>
          </Box>
        )}

        {/* Administration */}
        {tab === 7 && (
          <Box>
            <Typography variant="h5">Administration</Typography>
            <Typography>Administration feature coming soon...</Typography>
          </Box>
        )}

        {/* Inventory */}
        {tab === 8 && (
          <Box>
            <Typography variant="h5">Inventory</Typography>
            <Typography>Inventory feature coming soon...</Typography>
          </Box>
        )}

        {message && <Alert severity="info" sx={{ mt: 3 }}>{message}</Alert>}
      </Container>
    </>
  );
}

// Digital Logbook Component (your exact HTML converted to React)
function DigitalLogbook() {
  const [unit, setUnit] = useState('');
  const [pest, setPest] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('');
  const [permission, setPermission] = useState('');
  const [occupied, setOccupied] = useState('');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [logbookEntries, setLogbookEntries] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('unit', unit);
    formData.append('pest', pest);
    formData.append('area', area);
    formData.append('description', description);
    formData.append('reporter', reporter);
    formData.append('permission', permission);
    formData.append('occupied', occupied);
    if (photo) formData.append('photo', photo);

    try {
      const res = await axios.post(`${API_BASE}/logbook`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Report submitted successfully!');
      setLogbookEntries([res.data, ...logbookEntries]);
      setUnit(''); setPest(''); setArea(''); setDescription(''); setReporter(''); setPermission(''); setOccupied(''); setPhoto(null);
    } catch (err) {
      setMessage('Submission failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Digital Logbook</Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Submit pest sightings, photos, and notes. This helps us schedule the right technician for your next service.
        </Typography>

        <Paper sx={{ p: 4, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <TextField label="Room/Unit Number *" fullWidth value={unit} onChange={(e) => setUnit(e.target.value)} required sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Pest Type *</InputLabel>
              <Select value={pest} onChange={(e) => setPest(e.target.value)} required>
                <MenuItem value="Cockroach">Cockroach</MenuItem>
                <MenuItem value="Scorpion">Scorpion</MenuItem>
                <MenuItem value="Ant">Ant</MenuItem>
                <MenuItem value="Spider">Spider</MenuItem>
                <MenuItem value="Rodent">Rodent</MenuItem>
                <MenuItem value="Bed Bug">Bed Bug</MenuItem>
                <MenuItem value="Termite">Termite</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Room/Area *</InputLabel>
              <Select value={area} onChange={(e) => setArea(e.target.value)} required>
                <MenuItem value="Kitchen">Kitchen</MenuItem>
                <MenuItem value="Bedroom">Bedroom</MenuItem>
                <MenuItem value="Bathroom">Bathroom</MenuItem>
                <MenuItem value="Living Room">Living Room</MenuItem>
                <MenuItem value="Hallway">Hallway</MenuItem>
                <MenuItem value="Garage">Garage</MenuItem>
                <MenuItem value="Exterior">Exterior</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Description" multiline rows={4} fullWidth value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Upload Photo (optional)" type="file" fullWidth onChange={(e) => setPhoto(e.target.files[0])} sx={{ mb: 2 }} />
            <TextField label="Reporter Name *" fullWidth value={reporter} onChange={(e) => setReporter(e.target.value)} required sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Permission to Enter? *</InputLabel>
              <Select value={permission} onChange={(e) => setPermission(e.target.value)} required>
                <MenuItem value="Yes">Yes - enter anytime</MenuItem>
                <MenuItem value="No">No - resident must be present</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Unit Status *</InputLabel>
              <Select value={occupied} onChange={(e) => setOccupied(e.target.value)} required>
                <MenuItem value="Occupied">Occupied</MenuItem>
                <MenuItem value="Vacant">Vacant</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" fullWidth size="large">
              Submit Report
            </Button>
          </form>
          {message && <Alert severity="success" sx={{ mt: 3 }}>{message}</Alert>}
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Recent Logbook Entries</Typography>
          {logbookEntries.length === 0 ? (
            <Typography color="textSecondary">No recent entries yet.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Pest</TableCell>
                  <TableCell>Area</TableCell>
                  <TableCell>Reporter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logbookEntries.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell>{moment(entry.date || entry.createdAt).format('MM/DD/YYYY hh:mm A')}</TableCell>
                    <TableCell>{entry.unit}</TableCell>
                    <TableCell>{entry.pest}</TableCell>
                    <TableCell>{entry.area}</TableCell>
                    <TableCell>{entry.reporter}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </Container>
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