import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert,
  Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, IconButton,
  useMediaQuery, useTheme
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';
import MapIcon from '@mui/icons-material/Map';
import OptimizeIcon from '@mui/icons-material/Tune';
import RepeatIcon from '@mui/icons-material/Repeat';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const localizer = momentLocalizer(moment);
const theme = createTheme({ palette: { primary: { main: '#1B5E20' } } });
const API_BASE = 'https://azex-backend-v2.onrender.com/api';
const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const DOCUMENT_CATEGORIES = ['License', 'Certification', 'Resume', 'ID Document', 'Write-up', 'Performance Review', 'Training', 'Other'];
const PRODUCT_CATEGORIES = ['Pesticide', 'Rodenticide', 'Termiticide', 'Bait', 'Trap', 'Equipment', 'Other'];
const TAX_RATE = 0.086;
const MAX_STOPS_PER_DAY = 15;
const DEFAULT_SERVICE_MINUTES = 45;
const DAYS_OF_WEEK = ['Any', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const RECURRENCE_OPTIONS = ['None', 'Monthly', 'Bi-Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

const OSRM_TABLE = 'http://router.project-osrm.org/table/v1/driving/';
const OSRM_ROUTE = 'http://router.project-osrm.org/route/v1/driving/';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

async function geocodeAddress(address) {
  if (!address || address.trim() === '') return null;
  const query = encodeURIComponent(address.trim());
  try {
    const res = await fetch(`${NOMINATIM}?q=${query}&format=json&limit=1`);
    const data = await res.json();
    if (data && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.error('Geocode error', e);
  }
  return null;
}

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
  const themeHook = useTheme();
  const isMobile = useMediaQuery(themeHook.breakpoints.down('sm'));

  const [tab, setTab] = useState(0);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');
  const [mapPoints, setMapPoints] = useState([]);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const invoiceRef = useRef(null);

  // Customer states with preferences and recurrence
  const [editingId, setEditingId] = useState(null);
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
    multiUnit: false,
    preferredDay: 'Any',
    preferredWindow: 'Anytime',
    recurrence: 'None',
    lastServiceDate: '',
    nextServiceDate: ''
  };
  const [newCustomer, setNewCustomer] = useState(initialNewCustomer);

  // Technician states unchanged (from previous)

  // Inventory, Invoice states unchanged

  const token = localStorage.getItem('jwt_token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/branches`, headers)
        .then(res => {
          setBranches(res.data);
          // Auto-select first branch if none selected
          if (res.data.length > 0 && selectedBranch === '') {
            setSelectedBranch(res.data[0].id);
          }
        })
        .catch(err => console.error(err));

      // Other fetches (technicians, products, etc.)
      axios.get(`${API_BASE}/technicians`, headers)
        .then(res => {
          setTechnicians(res.data);
          setTechList(res.data);
        })
        .catch(err => console.error(err));

      axios.get(`${API_BASE}/products`, headers)
        .then(res => setProducts(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  // All other useEffects unchanged

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
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Branch</InputLabel>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value === '' ? '' : Number(e.target.value))}
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
            <Tab label="Technicians" />
            <Tab label="Inventory" />
          </Tabs>
        </Paper>

        {/* Inventory Tab with softer alert */}
        {tab === 8 && (
          <Box>
            <Typography variant="h5" gutterBottom>Inventory Management</Typography>

            {selectedBranch ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Current branch: {branches.find(b => b.id === Number(selectedBranch))?.name} — Stock levels shown below
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                Select a branch above to view and adjust inventory
              </Alert>
            )}

            {/* Rest of inventory content unchanged */}
          </Box>
        )}

        {/* Customers Tab with softer alert */}
        {tab === 6 && (
          <Box>
            <Typography variant="h5" gutterBottom>Manage Customers</Typography>

            {selectedBranch !== '' ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Current branch: {branches.find(b => b.id === selectedBranch)?.name || 'Unknown'}
              </Alert>
            ) : editingId ? null : (
              <Alert severity="info" sx={{ mb: 3 }}>
                Select a branch above to add new customers (editing existing customers is always available).
              </Alert>
            )}

            {/* Rest of customers content unchanged */}
          </Box>
        )}

        {/* Technicians Tab with clear info message */}
        {tab === 7 && (
          <Box>
            <Typography variant="h5" gutterBottom>Manage Technicians (HR)</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Technicians must be assigned to a specific branch. Select one in the form below when adding or editing.
            </Alert>

            {selectedBranch !== '' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Current branch filter: {branches.find(b => b.id === Number(selectedBranch))?.name}
              </Alert>
            )}

            {/* Rest of technicians content unchanged (branch dropdown is already required in form) */}
          </Box>
        )}

        {/* All other tabs unchanged */}

        {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 3 }}>{message}</Alert>}
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