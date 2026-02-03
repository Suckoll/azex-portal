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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
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
const MAX_STOPS_PER_DAY = 15; // Configurable limit
const DEFAULT_SERVICE_MINUTES = 45; // Default service time per stop

const DAYS_OF_WEEK = ['Any', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const OSRM_TABLE = 'http://router.project-osrm.org/table/v1/driving/';
const OSRM_ROUTE = 'http://router.project-osrm.org/route/v1/driving/';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

async function geocodeAddress(address) {
  if (!address || address.trim() === '') return null;
  const query = encodeURIComponent(address.trim());
  try {
    const res = await fetch(`${NOMINATIM}?q=${query}&format=json&limit=1&addressdetails=1`);
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
  // unchanged from previous
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

  // Customer states (add preferred)
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
    preferredWindow: 'Anytime'
  };
  const [newCustomer, setNewCustomer] = useState(initialNewCustomer);

  // Other states unchanged

  const token = localStorage.getItem('jwt_token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // useEffects unchanged, plus load jobs for branch

  useEffect(() => {
    if (token && selectedBranch) {
      axios.get(`${API_BASE}/jobs?branch_id=${selectedBranch}`, headers)
        .then(res => setJobs(res.data))
        .catch(() => setJobs([]));
    }
  }, [token, selectedBranch]);

  // Map and route load (enhanced with optimization logic below)

  const optimizeDailyRoute = async () => {
    const dayJobs = events.filter(e => moment(e.start).isSame(currentDate, 'day'));

    if (dayJobs.length === 0) {
      setMessage('No jobs today to optimize');
      return;
    }

    if (dayJobs.length > MAX_STOPS_PER_DAY) {
      setMessage(`Too many stops (${dayJobs.length} > ${MAX_STOPS_PER_DAY}). Consider splitting the day.`);
      return;
    }

    const branch = branches.find(b => b.id === selectedBranch);
    if (!branch) return;

    setMessage('Optimizing route... (geocoding & calculating shortest path)');

    const locations = [
      { type: 'branch', name: `${branch.name} (Start/End)`, address: `${branch.address || ''}, ${branch.city}, ${branch.state}` }
    ];

    dayJobs.forEach((job, idx) => {
      const cust = job.customer || {};
      locations.push({
        type: 'job',
        jobId: job.id,
        originalIndex: idx,
        name: cust.firstName ? `${cust.firstName} ${cust.lastName}` : job.title,
        address: `${cust.address || ''}, ${cust.city || ''}, ${cust.state || ''} ${cust.zip || ''}`
      });
    });

    const geocoded = [];
    for (const loc of locations) {
      const latLng = await geocodeAddress(loc.address);
      if (latLng) {
        geocoded.push({ ...loc, lat: latLng[0], lng: latLng[1] });
      }
    }

    if (geocoded.length < locations.length) {
      setMessage('Some addresses could not be geocoded — optimization skipped');
      return;
    }

    const coordsStr = geocoded.map(g => `${g.lng},${g.lat}`).join(';');

    // Get duration matrix
    const tableRes = await fetch(`${OSRM_TABLE}${coordsStr}?annotations=duration`);
    const tableJson = await tableRes.json();
    const durations = tableJson.durations; // seconds

    // Greedy nearest neighbor starting from branch (index 0)
    let current = 0;
    const visited = new Set([0]);
    const order = [0];

    while (visited.size < geocoded.length) {
      let minDur = Infinity;
      let next = -1;
      for (let i = 0; i < geocoded.length; i++) {
        if (!visited.has(i) && durations[current][i] < minDur) {
          minDur = durations[current][i];
          next = i;
        }
      }
      if (next === -1) break;
      visited.add(next);
      order.push(next);
      current = next;
    }

    // Optimized order
    const optimizedOrder = order.map(i => geocoded[i]);

    // Update map points & polyline
    setMapPoints(optimizedOrder.map(p => ({ lat: p.lat, lng: p.lng, name: p.name })));

    const orderedCoords = order.map(i => `${geocoded[i].lng},${geocoded[i].lat}`).join(';');
    const routeRes = await fetch(`${OSRM_ROUTE}${orderedCoords}?overview=full&geometries=polyline`);
    const routeJson = await routeRes.json();
    if (routeJson.routes?.[0]) {
      const geometry = routeJson.routes[0].geometry;
      const decoded = polyline.decode(geometry);
      setRoutePolyline(decoded);
      const distKm = routeJson.routes[0].distance / 1000;
      const durMin = routeJson.routes[0].duration / 60;
      setRouteInfo({ distance: distKm.toFixed(1), duration: Math.round(durMin) });
    }

    // Recalculate times with travel + service
    let currentTime = moment(currentDate).hour(8).minute(0); // Default start 8 AM

    const updatedJobs = [];
    let prevIndex = 0;
    for (let i = 1; i < order.length; i++) {
      const geo = geocoded[order[i]];
      if (geo.type === 'job') {
        const travelMin = durations[prevIndex][order[i]] / 60;
        currentTime = currentTime.add(travelMin, 'minutes');

        const start = currentTime.clone();
        const end = currentTime.add(DEFAULT_SERVICE_MINUTES, 'minutes');

        updatedJobs.push({
          id: geo.jobId,
          start: start.toDate(),
          end: end.toDate()
        });

        currentTime = end;
        prevIndex = order[i];
      }
    }

    // Update local events
    const newEvents = events.map(e => {
      const updated = updatedJobs.find(u => u.id === e.id);
      if (updated && moment(e.start).isSame(currentDate, 'day')) {
        return { ...e, start: updated.start, end: updated.end };
      }
      return e;
    });
    setEvents(newEvents);

    // Save to backend
    for (const u of updatedJobs) {
      await axios.put(`${API_BASE}/jobs/${u.id}`, {
        start: u.start.toISOString(),
        end: u.end.toISOString()
      }, headers);
    }

    setMessage(`Route optimized! ${dayJobs.length} stops, ~${routeInfo.distance} km travel`);
  };

  // In Customers tab form, add preferred fields
  // Inside the grid after multiUnit
  <FormControl fullWidth>
    <InputLabel>Preferred Service Day</InputLabel>
    <Select value={newCustomer.preferredDay || 'Any'} onChange={e => setNewCustomer({...newCustomer, preferredDay: e.target.value})}>
      {DAYS_OF_WEEK.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
    </Select>
  </FormControl>
  <TextField label="Preferred Time Window" value={newCustomer.preferredWindow || ''} onChange={e => setNewCustomer({...newCustomer, preferredWindow: e.target.value})} fullWidth placeholder="e.g., Anytime, 9-11am, After 2pm" sx={{ gridColumn: { xs: 'span 2', md: 'span 1' } }} />

  // In table, add columns for preferred

  // In calendar tab, add the button
  {selectedTech && events.some(e => moment(e.start).isSame(currentDate, 'day')) && (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      <Button variant="contained" color="secondary" startIcon={<OptimizeIcon />} onClick={optimizeDailyRoute}>
        Optimize Today's Route (Shortest Driving)
      </Button>
      {events.filter(e => moment(e.start).isSame(currentDate, 'day')).length > MAX_STOPS_PER_DAY && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {events.filter(e => moment(e.start).isSame(currentDate, 'day')).length} stops exceed max ({MAX_STOPS_PER_DAY}) — consider rescheduling
        </Alert>
      )}
    </Box>
  )}

  // The rest of the calendar tab with map unchanged, but now optimization updates times and route

  // Other tabs unchanged

  const logout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/';
  };

  return (
    // Full JSX unchanged except additions above
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