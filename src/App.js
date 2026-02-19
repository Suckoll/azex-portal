import React, { useState, useEffect, useRef, useMemo } from 'react';
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

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

  const token = localStorage.getItem('jwt_token');
  const headers = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/branches`, headers)
        .then(res => {
          setBranches(res.data);
          if (res.data.length > 0 && selectedBranch === '') {
            setSelectedBranch(res.data[0].id);   // Copilot fix - moved here
          }
        })
        .catch(() => setMessage('Failed to load branches'));
    }
  }, [token, headers]);  // Copilot fix - removed selectedBranch from dependencies

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

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Welcome to AZEX Customer Management System</Typography>
            <Typography paragraph>
              Selected Branch: {selectedBranch === '' ? 'Loading...' : branches.find(b => b.id === selectedBranch)?.name || 'None'}
            </Typography>
          </Box>
        )}

        {message && <Alert severity="info" sx={{ mt: 3 }}>{message}</Alert>}
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