import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert,
  Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, IconButton,
  useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions
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
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Leaflet fix
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
  const [deals, setDeals] = useState([]);
  const [message, setMessage] = useState('');
  const [mapPoints, setMapPoints] = useState([]);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const invoiceRef = useRef(null);

  // Employee states
  const [employeeList, setEmployeeList] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState('Other');

  const initialNewEmployee = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'AZ',
    zip: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    hireDate: '',
    payType: 'Hourly',
    hourlyRate: '',
    salary: '',
    commissionRate: '',
    role: 'Technician',
    employmentStatus: 'Active',
    branchId: '',
    photo: null
  };
  const [newEmployee, setNewEmployee] = useState(initialNewEmployee);

  // Deal states
  const [salesSubTab, setSalesSubTab] = useState(0);
  const [editingDealId, setEditingDealId] = useState(null);
  const initialNewDeal = {
    title: '',
    customer_id: '',
    employee_id: '',
    amount: 0,
    status: 'Lead',
    expected_close_date: '',
    notes: ''
  };
  const [newDeal, setNewDeal] = useState(initialNewDeal);

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
        .catch(err => setMessage('Failed to load branches'));

      axios.get(`${API_BASE}/employees`, headers)
        .then(res => {
          setEmployeeList(res.data);
          setTechnicians(res.data.filter(e => e.role === 'Technician'));
        })
        .catch(err => console.error(err));

      axios.get(`${API_BASE}/products`, headers)
        .then(res => setProducts(res.data))
        .catch(err => console.error(err));

      axios.get(`${API_BASE}/deals`, headers)
        .then(res => setDeals(res.data))
        .catch(err => console.error(err));
    }
  }, [token, headers, selectedBranch]);

  // Other useEffects unchanged

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
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered variant={isMobile ? 'scrollable' : 'standard'}>
            <Tab label="Dashboard" />
            <Tab label="Calendar" />
            <Tab label="Sales" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Digital Logbook" />
            <Tab label="Payments" />
            <Tab label="Customers" />
            <Tab label="Administration" />
            <Tab label="Inventory" />
          </Tabs>
        </Paper>

        {/* Sales Tab with Pipeline and Reports */}
        {tab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>Sales</Typography>

            <Paper sx={{ mb: 3 }}>
              <Tabs value={salesSubTab} onChange={(e, v) => setSalesSubTab(v)} centered>
                <Tab label="Pipeline" />
                <Tab label="Reports" />
              </Tabs>
            </Paper>

            {salesSubTab === 0 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Kanban pipeline — click cards to edit.
                </Alert>

                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 2 }}>
                  {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'].map(stage => (
                    <Paper key={stage} sx={{ minWidth: 300, p: 2, bgcolor: stage === 'Won' ? 'success.light' : stage === 'Lost' ? 'error.light' : 'background.paper' }}>
                      <Typography variant="h6">{stage}</Typography>
                      <Typography variant="caption">
                        Total: ${deals.filter(d => d.status === stage).reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                      </Typography>
                      {deals.filter(d => d.status === stage).map(deal => (
                        <Paper key={deal.id} sx={{ p: 2, mb: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider' }} onClick={() => {
                          setEditingDealId(deal.id);
                          setNewDeal({
                            title: deal.title,
                            customer_id: deal.customer_id,
                            employee_id: deal.employee_id || '',
                            amount: deal.amount,
                            status: deal.status,
                            expected_close_date: deal.expected_close_date ? moment(deal.expected_close_date).format('YYYY-MM-DD') : '',
                            notes: deal.notes || ''
                          });
                        }}>
                          <Typography variant="subtitle1">{deal.title}</Typography>
                          <Typography variant="body2">Customer: {deal.customer_name}</Typography>
                          <Typography variant="body2">Rep: {deal.employee_name}</Typography>
                          <Typography variant="body2">Amount: ${deal.amount.toFixed(2)}</Typography>
                          <Typography variant="body2">Close: {deal.expected_close_date ? moment(deal.expected_close_date).format('MM/DD/YYYY') : 'N/A'}</Typography>
                          <Box sx={{ mt: 1 }}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteDeal(deal.id); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      ))}
                    </Paper>
                  ))}
                </Box>

                <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
                  setEditingDealId(null);
                  setNewDeal(initialNewDeal);
                }}>
                  New Deal
                </Button>
              </Box>
            )}

            {salesSubTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Pipeline Reports</Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1">Revenue by Stage</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#1B5E20" name="Revenue ($)" />
                      <Bar dataKey="count" fill="#8884d8" name="Deal Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1">Win vs Lost Revenue</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={winLostData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {winLostData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Won' ? '#4CAF50' : '#F44336'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box>
                  <Typography variant="subtitle1">Key Metrics</Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Deals</TableCell>
                        <TableCell>{deals.length}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Pipeline Value</TableCell>
                        <TableCell>${deals.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Won Revenue</TableCell>
                        <TableCell>${deals.filter(d => d.status === 'Won').reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Win Rate</TableCell>
                        <TableCell>
                          {deals.filter(d => d.status === 'Won' || d.status === 'Lost').length > 0
                            ? ((deals.filter(d => d.status === 'Won').length / deals.filter(d => d.status === 'Won' || d.status === 'Lost').length) * 100).toFixed(1) + '%'
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            )}

            {/* Deal Form Modal */}
            <Dialog open={!!editingDealId || !editingDealId && newDeal.title !== ''} onClose={() => {
              setEditingDealId(null);
              setNewDeal(initialNewDeal);
            }}>
              <DialogTitle>{editingDealId ? 'Edit Deal' : 'New Deal'}</DialogTitle>
              <DialogContent>
                <TextField label="Title" fullWidth value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} sx={{ mb: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Customer</InputLabel>
                  <Select value={newDeal.customer_id} onChange={e => setNewDeal({...newDeal, customer_id: e.target.value})}>
                    <MenuItem value=""><em>Select</em></MenuItem>
                    {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.company || 'Personal'})</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Sales Rep</InputLabel>
                  <Select value={newDeal.employee_id || ''} onChange={e => setNewDeal({...newDeal, employee_id: e.target.value})}>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {employeeList.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Amount ($)" type="number" fullWidth value={newDeal.amount} onChange={e => setNewDeal({...newDeal, amount: e.target.value})} sx={{ mb: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={newDeal.status} onChange={e => setNewDeal({...newDeal, status: e.target.value})}>
                    {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Expected Close Date" type="date" fullWidth value={newDeal.expected_close_date} onChange={e => setNewDeal({...newDeal, expected_close_date: e.target.value})} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                <TextField label="Notes" multiline rows={4} fullWidth value={newDeal.notes} onChange={e => setNewDeal({...newDeal, notes: e.target.value})} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setEditingDealId(null);
                  setNewDeal(initialNewDeal);
                }}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveDeal}>Save</Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Other tabs unchanged */}

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