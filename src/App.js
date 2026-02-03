import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar, Toolbar, Typography, Button, Box, Card, CardContent, TextField, Alert,
  Container, Tabs, Tab, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, IconButton
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
const DOCUMENT_CATEGORIES = ['License', 'Certification', 'Resume', 'ID Document', 'Write-up', 'Performance Review', 'Training', 'Other'];
const PRODUCT_CATEGORIES = ['Pesticide', 'Rodenticide', 'Termiticide', 'Bait', 'Trap', 'Equipment', 'Other'];

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
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [message, setMessage] = useState('');

  // Customer states
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
    multiUnit: false
  };
  const [newCustomer, setNewCustomer] = useState(initialNewCustomer);

  // Technician states
  const [techList, setTechList] = useState([]);
  const [editingTechId, setEditingTechId] = useState(null);
  const [techSearch, setTechSearch] = useState('');
  const [techDocs, setTechDocs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState('Other');

  const initialNewTech = {
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
    payRate: '',
    employmentStatus: 'Active',
    branchId: ''
  };
  const [newTech, setNewTech] = useState(initialNewTech);

  // Inventory states
  const [editingProductId, setEditingProductId] = useState(null);
  const [adjustingStockId, setAdjustingStockId] = useState(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');

  const initialNewProduct = {
    name: '',
    category: 'Pesticide',
    manufacturer: '',
    epa_number: '',
    active_ingredients: '',
    unit: 'each',
    discontinued: false
  };
  const [newProduct, setNewProduct] = useState(initialNewProduct);

  const token = localStorage.getItem('jwt_token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/branches`, headers)
        .then(res => setBranches(res.data))
        .catch(err => console.error(err));

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

  useEffect(() => {
    if (token && selectedTech !== null) {
      axios.get(`${API_BASE}/jobs/${selectedTech}`, headers)
        .then(res => {
          const formatted = res.data.map(job => ({
            id: job.id,
            title: job.title,
            start: job.start ? new Date(job.start) : null,
            end: job.end ? new Date(job.end) : null,
            description: job.description,
            customer: job.customer
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
      const url = selectedBranch ? `${API_BASE}/customers?branch_id=${selectedBranch}` : `${API_BASE}/customers`;
      axios.get(url, headers)
        .then(res => setCustomers(res.data))
        .catch(err => console.error(err));
    }
  }, [token, selectedBranch]);

  useEffect(() => {
    if (token && selectedBranch) {
      axios.get(`${API_BASE}/stock?branch_id=${selectedBranch}`, headers)
        .then(res => setStock(res.data))
        .catch(err => console.error(err));
    } else {
      setStock([]);
    }
  }, [token, selectedBranch]);

  const handleScheduleChange = async ({ event, start, end }) => {
    const updatedEvents = events.map(e =>
      e.id === event.id ? { ...e, start: new Date(start), end: end ? new Date(end) : null } : e
    );
    setEvents(updatedEvents);

    try {
      await axios.put(`${API_BASE}/jobs/${event.id}`, {
        start: new Date(start).toISOString(),
        end: end ? new Date(end).toISOString() : null
      }, headers);
      setMessage('Schedule updated successfully!');
    } catch (err) {
      setMessage('Failed to update schedule');
    }
  };

  // Customer handlers
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
        await axios.put(`${API_BASE}/customers/${editingId}`, customerData, headers);
        setMessage('Customer updated successfully!');
      } else {
        await axios.post(`${API_BASE}/customers`, customerData, headers);
        setMessage('Customer added successfully!');
      }

      setEditingId(null);
      setNewCustomer(initialNewCustomer);

      const fetchUrl = selectedBranch ? `${API_BASE}/customers?branch_id=${selectedBranch}` : `${API_BASE}/customers`;
      const res = await axios.get(fetchUrl, headers);
      setCustomers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`${API_BASE}/customers/${id}`, headers);
        setMessage('Customer deleted successfully!');
        const fetchUrl = selectedBranch ? `${API_BASE}/customers?branch_id=${selectedBranch}` : `${API_BASE}/customers`;
        const res = await axios.get(fetchUrl, headers);
        setCustomers(res.data);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  // Technician handlers
  const handleSaveTech = async () => {
    if (!editingTechId && !newTech.branchId) {
      setMessage('Please select a branch');
      return;
    }

    const data = {
      firstName: newTech.firstName,
      lastName: newTech.lastName,
      email: newTech.email,
      phone: newTech.phone,
      address: newTech.address,
      city: newTech.city,
      state: newTech.state,
      zip: newTech.zip,
      dateOfBirth: newTech.dateOfBirth || null,
      emergencyContactName: newTech.emergencyContactName,
      emergencyContactPhone: newTech.emergencyContactPhone,
      hireDate: newTech.hireDate || null,
      payRate: newTech.payRate ? parseFloat(newTech.payRate) : null,
      employmentStatus: newTech.employmentStatus,
      branch_id: Number(newTech.branchId)
    };

    try {
      if (editingTechId) {
        await axios.put(`${API_BASE}/technicians/${editingTechId}`, data, headers);
        setMessage('Technician updated');
      } else {
        await axios.post(`${API_BASE}/technicians`, data, headers);
        setMessage('Technician added');
      }
      setEditingTechId(null);
      setNewTech(initialNewTech);
      const res = await axios.get(`${API_BASE}/technicians`, headers);
      setTechList(res.data);
      setTechnicians(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeleteTech = async (id) => {
    if (window.confirm('Delete this technician?')) {
      try {
        await axios.delete(`${API_BASE}/technicians/${id}`, headers);
        setMessage('Technician deleted');
        const res = await axios.get(`${API_BASE}/technicians`, headers);
        setTechList(res.data);
        setTechnicians(res.data);
      } catch (err) {
        setMessage('Delete failed');
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !editingTechId) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', docDescription);
    formData.append('category', docCategory);

    try {
      await axios.post(`${API_BASE}/technicians/${editingTechId}/documents`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Document uploaded');
      setSelectedFile(null);
      setDocDescription('');
      setDocCategory('Other');
      const res = await axios.get(`${API_BASE}/technicians/${editingTechId}/documents`, headers);
      setTechDocs(res.data);
    } catch (err) {
      setMessage('Upload failed');
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (window.confirm('Delete document?')) {
      try {
        await axios.delete(`${API_BASE}/technicians/${editingTechId}/documents/${docId}`, headers);
        setMessage('Document deleted');
        const res = await axios.get(`${API_BASE}/technicians/${editingTechId}/documents`, headers);
        setTechDocs(res.data);
      } catch (err) {
        setMessage('Delete failed');
      }
    }
  };

  useEffect(() => {
    if (editingTechId) {
      axios.get(`${API_BASE}/technicians/${editingTechId}/documents`, headers)
        .then(res => setTechDocs(res.data))
        .catch(() => setTechDocs([]));
    } else {
      setTechDocs([]);
    }
  }, [editingTechId]);

  // Inventory handlers
  const handleSaveProduct = async () => {
    const data = {
      name: newProduct.name,
      category: newProduct.category,
      manufacturer: newProduct.manufacturer || null,
      epa_number: newProduct.epa_number || null,
      active_ingredients: newProduct.active_ingredients || null,
      unit: newProduct.unit
    };

    try {
      if (editingProductId) {
        await axios.put(`${API_BASE}/products/${editingProductId}`, { ...data, discontinued: newProduct.discontinued }, headers);
        setMessage('Product updated');
      } else {
        await axios.post(`${API_BASE}/products`, data, headers);
        setMessage('Product added');
      }
      setEditingProductId(null);
      setNewProduct(initialNewProduct);
      const res = await axios.get(`${API_BASE}/products`, headers);
      setProducts(res.data);
      if (selectedBranch) {
        const stockRes = await axios.get(`${API_BASE}/stock?branch_id=${selectedBranch}`, headers);
        setStock(stockRes.data);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleAdjustStock = async (stockId, productId) => {
    if (!adjustmentValue || isNaN(adjustmentValue)) return;
    try {
      await axios.post(`${API_BASE}/stock/adjust`, {
        product_id: productId,
        branch_id: selectedBranch,
        adjustment: parseFloat(adjustmentValue)
      }, headers);
      setMessage('Stock adjusted');
      setAdjustingStockId(null);
      setAdjustmentValue('');
      const res = await axios.get(`${API_BASE}/stock?branch_id=${selectedBranch}`, headers);
      setStock(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Adjustment failed');
    }
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

  const filteredTechs = techList.filter(t => {
    const term = techSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      (t.email || '').toLowerCase().includes(term) ||
      (t.phone || '').toLowerCase().includes(term)
    );
  }).filter(t => !selectedBranch || t.branch_id === Number(selectedBranch));

  const dailyJobs = events
    .filter(e => e.start && moment(e.start).isSame(currentDate, 'day'))
    .sort((a, b) => a.start - b.start);

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

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Welcome to AZEX PestGuard Portal</Typography>
            <Typography paragraph>
              Selected Branch: {selectedBranch === '' ? 'All Branches' : branches.find(b => b.id === selectedBranch)?.name || 'Unknown Branch'}
            </Typography>
            <Typography>Technicians: {technicians.length}</Typography>
            <Typography>Customers: {customers.length}</Typography>
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
              <>
                <Box sx={{ height: '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onNavigate={(date) => setCurrentDate(moment(date))}
                    onEventDrop={handleScheduleChange}
                    onEventResize={handleScheduleChange}
                    resizable
                    draggableAccessor={() => true}
                  />
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Daily Route — {currentDate.format('dddd, MMMM Do, YYYY')}
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dailyJobs.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">No jobs scheduled today</TableCell></TableRow>
                      ) : dailyJobs.map(job => (
                        <TableRow key={job.id}>
                          <TableCell>
                            {job.start && moment(job.start).format('h:mm A')}
                            {job.end && ` - ${moment(job.end).format('h:mm A')}`}
                          </TableCell>
                          <TableCell>{job.customer?.name || job.title}</TableCell>
                          <TableCell>
                            {job.customer ? `${job.customer.address}, ${job.customer.city}, ${job.customer.state} ${job.customer.zip}` : ''}
                          </TableCell>
                          <TableCell>{job.customer?.phone || ''}</TableCell>
                          <TableCell>{job.description || ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </>
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
                Select a branch to add new customers (editing existing is still available).
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
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
                  {US_STATES.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Zip Code" value={newCustomer.zip} onChange={(e) => setNewCustomer({...newCustomer, zip: e.target.value})} />
              <FormControlLabel
                control={<Checkbox checked={newCustomer.multiUnit} onChange={(e) => setNewCustomer({...newCustomer, multiUnit: e.target.checked})} />}
                label="Multi-Unit Property"
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>

            <Typography variant="h6" gutterBottom>Bill To (if different)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <TextField label="Bill To Name" value={newCustomer.billName} onChange={(e) => setNewCustomer({...newCustomer, billName: e.target.value})} />
              <TextField label="Bill To Email" value={newCustomer.billEmail} onChange={(e) => setNewCustomer({...newCustomer, billEmail: e.target.value})} />
              <TextField label="Bill To Phone" value={newCustomer.billPhone} onChange={(e) => setNewCustomer({...newCustomer, billPhone: e.target.value})} />
              <TextField label="Bill To Address" value={newCustomer.billAddress} onChange={(e) => setNewCustomer({...newCustomer, billAddress: e.target.value})} fullWidth sx={{ gridColumn: 'span 2' }} />
              <TextField label="Bill To City" value={newCustomer.billCity} onChange={(e) => setNewCustomer({...newCustomer, billCity: e.target.value})} />
              <FormControl>
                <InputLabel>Bill To State</InputLabel>
                <Select value={newCustomer.billState} onChange={(e) => setNewCustomer({...newCustomer, billState: e.target.value})}>
                  {US_STATES.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Bill To Zip" value={newCustomer.billZip} onChange={(e) => setNewCustomer({...newCustomer, billZip: e.target.value})} />
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
              <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
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
                      <TableCell>{c.address}, {c.city}, {c.state} {c.zip}</TableCell>
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
                          onClick={() => handleDeleteCustomer(c.id)}
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

        {tab === 7 && (
          <Box>
            <Typography variant="h5" gutterBottom>Manage Technicians (HR)</Typography>

            {selectedBranch !== '' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Current branch: {branches.find(b => b.id === Number(selectedBranch))?.name}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              {editingTechId ? 'Edit Technician' : 'Add New Technician'}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
              <TextField label="First Name" value={newTech.firstName} onChange={e => setNewTech({...newTech, firstName: e.target.value})} required />
              <TextField label="Last Name" value={newTech.lastName} onChange={e => setNewTech({...newTech, lastName: e.target.value})} required />
              <TextField label="Email" value={newTech.email} onChange={e => setNewTech({...newTech, email: e.target.value})} />
              <TextField label="Phone" value={newTech.phone} onChange={e => setNewTech({...newTech, phone: e.target.value})} />
              <FormControl required>
                <InputLabel>Branch</InputLabel>
                <Select value={newTech.branchId} onChange={e => setNewTech({...newTech, branchId: e.target.value})}>
                  {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Address" value={newTech.address} onChange={e => setNewTech({...newTech, address: e.target.value})} fullWidth sx={{ gridColumn: 'span 2' }} />
              <TextField label="City" value={newTech.city} onChange={e => setNewTech({...newTech, city: e.target.value})} />
              <FormControl>
                <InputLabel>State</InputLabel>
                <Select value={newTech.state} onChange={e => setNewTech({...newTech, state: e.target.value})}>
                  {US_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Zip" value={newTech.zip} onChange={e => setNewTech({...newTech, zip: e.target.value})} />
              <TextField label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={newTech.dateOfBirth} onChange={e => setNewTech({...newTech, dateOfBirth: e.target.value})} />
              <TextField label="Emergency Contact Name" value={newTech.emergencyContactName} onChange={e => setNewTech({...newTech, emergencyContactName: e.target.value})} />
              <TextField label="Emergency Contact Phone" value={newTech.emergencyContactPhone} onChange={e => setNewTech({...newTech, emergencyContactPhone: e.target.value})} />
              <TextField label="Hire Date" type="date" InputLabelProps={{ shrink: true }} value={newTech.hireDate} onChange={e => setNewTech({...newTech, hireDate: e.target.value})} />
              <TextField label="Hourly Pay Rate" type="number" value={newTech.payRate} onChange={e => setNewTech({...newTech, payRate: e.target.value})} />
              <FormControl>
                <InputLabel>Employment Status</InputLabel>
                <Select value={newTech.employmentStatus} onChange={e => setNewTech({...newTech, employmentStatus: e.target.value})}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button variant="contained" onClick={handleSaveTech}>
                {editingTechId ? 'Update' : 'Add'} Technician
              </Button>
              {editingTechId && (
                <Button variant="outlined" onClick={() => {
                  setEditingTechId(null);
                  setNewTech(initialNewTech);
                  setMessage('');
                }}>Cancel</Button>
              )}
            </Box>

            {editingTechId && (
              <>
                <Typography variant="h6" gutterBottom>Documents</Typography>
                <Box sx={{ mb: 3 }}>
                  <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
                  {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
                  <TextField label="Description" value={docDescription} onChange={e => setDocDescription(e.target.value)} fullWidth sx={{ mt: 1 }} />
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel>Category</InputLabel>
                    <Select value={docCategory} onChange={e => setDocCategory(e.target.value)}>
                      {DOCUMENT_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Button variant="contained" onClick={handleUploadDocument} disabled={!selectedFile} sx={{ mt: 2 }}>
                    Upload Document
                  </Button>
                </Box>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>File</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {techDocs.length === 0 ? (
                      <TableRow><TableCell colSpan={5}>No documents uploaded</TableCell></TableRow>
                    ) : techDocs.map(d => (
                      <TableRow key={d.id}>
                        <TableCell>{moment(d.uploadDate).format('YYYY-MM-DD')}</TableCell>
                        <TableCell>{d.category}</TableCell>
                        <TableCell>{d.description}</TableCell>
                        <TableCell>
                          <a href={d.url} target="_blank" rel="noopener noreferrer">{d.filename}</a>
                        </TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => handleDeleteDoc(d.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            {message && <Alert severity={message.includes('success') || message.includes('uploaded') ? 'success' : 'error'} sx={{ mt: 3 }}>{message}</Alert>}

            <TextField
              fullWidth
              placeholder="Search technicians..."
              value={techSearch}
              onChange={e => setTechSearch(e.target.value)}
              sx={{ mb: 3, mt: 4 }}
            />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Hire Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTechs.length === 0 ? (
                  <TableRow><TableCell colSpan={7}>No technicians found</TableCell></TableRow>
                ) : filteredTechs.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.email || '-'}</TableCell>
                    <TableCell>{t.phone || '-'}</TableCell>
                    <TableCell>{branches.find(b => b.id === t.branch_id)?.name || '-'}</TableCell>
                    <TableCell>{t.hireDate ? moment(t.hireDate).format('YYYY-MM-DD') : '-'}</TableCell>
                    <TableCell>{t.employmentStatus}</TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => {
                        setNewTech({
                          firstName: t.firstName,
                          lastName: t.lastName,
                          email: t.email || '',
                          phone: t.phone || '',
                          address: t.address || '',
                          city: t.city || '',
                          state: t.state || 'AZ',
                          zip: t.zip || '',
                          dateOfBirth: t.dateOfBirth || '',
                          emergencyContactName: t.emergencyContactName || '',
                          emergencyContactPhone: t.emergencyContactPhone || '',
                          hireDate: t.hireDate || '',
                          payRate: t.payRate || '',
                          employmentStatus: t.employmentStatus,
                          branchId: t.branch_id
                        });
                        setEditingTechId(t.id);
                      }}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteTech(t.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {tab === 8 && (
          <Box>
            <Typography variant="h5" gutterBottom>Inventory Management</Typography>

            {selectedBranch ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Current branch: {branches.find(b => b.id === Number(selectedBranch))?.name} — Stock levels shown below
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Select a branch to view and adjust inventory
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              {editingProductId ? 'Edit Product' : 'Add New Product'}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
              <TextField label="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
              <FormControl required>
                <InputLabel>Category</InputLabel>
                <Select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  {PRODUCT_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Manufacturer" value={newProduct.manufacturer} onChange={e => setNewProduct({...newProduct, manufacturer: e.target.value})} />
              <TextField label="EPA Registration #" value={newProduct.epa_number} onChange={e => setNewProduct({...newProduct, epa_number: e.target.value})} />
              <TextField label="Active Ingredients" multiline rows={2} value={newProduct.active_ingredients} onChange={e => setNewProduct({...newProduct, active_ingredients: e.target.value})} fullWidth sx={{ gridColumn: 'span 2' }} />
              <TextField label="Unit of Measure" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
              {editingProductId && (
                <FormControlLabel control={<Checkbox checked={newProduct.discontinued} onChange={e => setNewProduct({...newProduct, discontinued: e.target.checked})} />} label="Discontinued" sx={{ gridColumn: 'span 2' }} />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button variant="contained" onClick={handleSaveProduct}>
                {editingProductId ? 'Update' : 'Add'} Product
              </Button>
              {editingProductId && (
                <Button variant="outlined" onClick={() => {
                  setEditingProductId(null);
                  setNewProduct(initialNewProduct);
                }}>Cancel</Button>
              )}
            </Box>

            <Typography variant="h6" gutterBottom>Product Catalog</Typography>
            <Table sx={{ mb: 6 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell>EPA #</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow><TableCell colSpan={7}>No products yet</TableCell></TableRow>
                ) : products.map(p => (
                  <TableRow key={p.id} sx={{ opacity: p.discontinued ? 0.6 : 1 }}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.manufacturer}</TableCell>
                    <TableCell>{p.epa_number}</TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell>{p.discontinued ? 'Discontinued' : 'Active'}</TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => {
                        setNewProduct({
                          name: p.name,
                          category: p.category,
                          manufacturer: p.manufacturer || '',
                          epa_number: p.epa_number || '',
                          active_ingredients: p.active_ingredients || '',
                          unit: p.unit,
                          discontinued: p.discontinued
                        });
                        setEditingProductId(p.id);
                      }}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {selectedBranch && (
              <>
                <Typography variant="h6" gutterBottom>Current Branch Inventory</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>EPA #</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Reorder Level</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Adjust Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stock.length === 0 ? (
                      <TableRow><TableCell colSpan={7}>No inventory data</TableCell></TableRow>
                    ) : stock.map(s => (
                      <TableRow key={s.id} sx={{ bgcolor: s.low_stock ? 'error.light' : 'inherit' }}>
                        <TableCell>{s.product_name}</TableCell>
                        <TableCell>{s.category}</TableCell>
                        <TableCell>{s.epa_number}</TableCell>
                        <TableCell>{s.quantity} {s.unit}</TableCell>
                        <TableCell>{s.reorder_level}</TableCell>
                        <TableCell>{s.low_stock ? 'LOW STOCK' : s.discontinued ? 'Discontinued' : 'OK'}</TableCell>
                        <TableCell>
                          {adjustingStockId === s.id ? (
                            <>
                              <TextField type="number" size="small" value={adjustmentValue} onChange={e => setAdjustmentValue(e.target.value)} sx={{ width: 100 }} placeholder="± value" />
                              <Button size="small" onClick={() => handleAdjustStock(s.id, s.product_id)} sx={{ ml: 1 }}>Apply</Button>
                              <Button size="small" onClick={() => { setAdjustingStockId(null); setAdjustmentValue(''); }}>Cancel</Button>
                            </>
                          ) : (
                            <Button size="small" onClick={() => { setAdjustingStockId(s.id); setAdjustmentValue(''); }}>
                              Adjust
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 3 }}>{message}</Alert>}
          </Box>
        )}

        {message && tab !== 6 && tab !== 7 && tab !== 8 && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 3 }}>
            {message}
          </Alert>
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