import React, { useState, useEffect, useRef } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const localizer = momentLocalizer(moment);
const theme = createTheme({ palette: { primary: { main: '#1B5E20' } } });
const API_BASE = 'https://azex-backend-v2.onrender.com/api';
const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const DOCUMENT_CATEGORIES = ['License', 'Certification', 'Resume', 'ID Document', 'Write-up', 'Performance Review', 'Training', 'Other'];
const PRODUCT_CATEGORIES = ['Pesticide', 'Rodenticide', 'Termiticide', 'Bait', 'Trap', 'Equipment', 'Other'];
const TAX_RATE = 0.086; // 8.6% Arizona average

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
  const [invoices, setInvoices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');
  const invoiceRef = useRef(null);

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

  // Invoice states
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [invoiceCustomerId, setInvoiceCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(moment().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('Draft');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [lineItems, setLineItems] = useState([
    { description: '', service_address: '', unit: '', quantity: 1, unit_price: 0 }
  ]);

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
        .catch(() => setStock([]));

      axios.get(`${API_BASE}/invoices?branch_id=${selectedBranch}`, headers)
        .then(res => setInvoices(res.data))
        .catch(() => setInvoices([]));

      axios.get(`${API_BASE}/jobs?branch_id=${selectedBranch}`, headers)
        .then(res => setJobs(res.data))
        .catch(() => setJobs([]));
    } else {
      setStock([]);
      setInvoices([]);
      setJobs([]);
    }
  }, [token, selectedBranch]);

  // Customer, Technician, Inventory handlers unchanged (omitted for brevity but keep from previous version)

  // Invoice calculations
  const calculateLineTotal = (item) => (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);

  const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);

  const calculateTax = () => calculateSubtotal() * TAX_RATE;

  const calculateGrandTotal = () => calculateSubtotal() + calculateTax();

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', service_address: '', unit: '', quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const autoAddFromJobs = () => {
    const newLines = selectedJobs.map(job => ({
      description: `Service on ${moment(job.start).format('MM/DD/YYYY')} by ${job.technician_name || 'Technician'}`,
      service_address: job.customer_address || '',
      unit: '',
      quantity: 1,
      unit_price: 150.00
    }));
    setLineItems([...lineItems, ...newLines]);
    setSelectedJobs([]);
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Invoice-${invoices.find(i => i.id === editingInvoiceId)?.invoice_number || 'Draft'}.pdf`);
  };

  const handleEmailInvoice = async () => {
    if (!invoiceRef.current || !editingInvoiceId) return;

    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    const pdfBlob = pdf.output('blob');

    const formData = new FormData();
    formData.append('pdf', pdfBlob, `Invoice-${invoices.find(i => i.id === editingInvoiceId)?.invoice_number || 'Draft'}.pdf`);

    const customer = customers.find(c => c.id === Number(invoiceCustomerId));
    if (customer?.billEmail || customer?.email) {
      formData.append('to_email', customer.billEmail || customer.email);
    }

    try {
      await axios.post(`${API_BASE}/invoices/${editingInvoiceId}/email`, formData, headers);
      setMessage('Invoice emailed successfully!');
      const res = await axios.get(`${API_BASE}/invoices?branch_id=${selectedBranch}`, headers);
      setInvoices(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to email invoice');
    }
  };

  const handleViewInvoice = async (invoice) => {
    setEditingInvoiceId(invoice.id);
    setInvoiceCustomerId(invoice.customer_id);
    setInvoiceDate(moment(invoice.invoice_date).format('YYYY-MM-DD'));
    setDueDate(invoice.due_date ? moment(invoice.due_date).format('YYYY-MM-DD') : '');
    setInvoiceNotes(invoice.notes || '');
    setInvoiceStatus(invoice.status);
    setLineItems(invoice.items.map(item => ({
      description: item.description,
      service_address: item.service_address || '',
      unit: item.unit || '',
      quantity: item.quantity,
      unit_price: item.unit_price
    })));

    axios.get(`${API_BASE}/invoices/${invoice.id}/payments`, headers)
      .then(res => setPayments(res.data))
      .catch(() => setPayments([]));
  };

  // Other handlers (save, delete, mark paid) unchanged

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

        {/* Other tabs unchanged */}

        {tab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>Invoices</Typography>

            {selectedBranch ? (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Current branch: {branches.find(b => b.id === Number(selectedBranch))?.name} | Tax Rate: {(TAX_RATE * 100).toFixed(1)}%
                </Alert>

                <Typography variant="h6" gutterBottom>
                  {editingInvoiceId ? 'View/Edit Invoice' : 'Create New Invoice'}
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Customer</InputLabel>
                    <Select value={invoiceCustomerId} onChange={e => setInvoiceCustomerId(e.target.value)}>
                      <MenuItem value=""><em>Select customer</em></MenuItem>
                      {customers.map(c => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                    <TextField label="Invoice Date" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <FormControl>
                      <InputLabel>Status</InputLabel>
                      <Select value={invoiceStatus} onChange={e => setInvoiceStatus(e.target.value)}>
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Sent">Sent</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {customers.find(c => c.id === Number(invoiceCustomerId))?.multiUnit && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Multi-unit customer — use Service Address/Unit fields below.
                    </Alert>
                  )}

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Link Jobs (auto-add lines)</InputLabel>
                    <Select multiple value={selectedJobs.map(j => j.id)} onChange={e => {
                      const vals = e.target.value;
                      setSelectedJobs(jobs.filter(j => vals.includes(j.id)));
                    }}>
                      {jobs.filter(j => j.status !== 'Billed').map(j => (
                        <MenuItem key={j.id} value={j.id}>
                          {moment(j.start).format('MM/DD/YYYY')} - {j.customer_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedJobs.length > 0 && (
                    <Button onClick={autoAddFromJobs} sx={{ mb: 2 }}>Add Selected Jobs</Button>
                  )}

                  <Typography variant="subtitle1" gutterBottom>Line Items</Typography>
                  {lineItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 50px', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField placeholder="Description" value={item.description} onChange={e => updateLineItem(index, 'description', e.target.value)} />
                      <TextField placeholder="Service Address" value={item.service_address} onChange={e => updateLineItem(index, 'service_address', e.target.value)} />
                      <TextField placeholder="Unit #" value={item.unit} onChange={e => updateLineItem(index, 'unit', e.target.value)} />
                      <TextField type="number" placeholder="Qty" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', e.target.value)} />
                      <TextField type="number" placeholder="Price" value={item.unit_price} onChange={e => updateLineItem(index, 'unit_price', e.target.value)} />
                      <TextField value={calculateLineTotal(item).toFixed(2)} disabled />
                      <IconButton onClick={() => removeLineItem(index)} color="error"><RemoveIcon /></IconButton>
                    </Box>
                  ))}

                  <Button startIcon={<AddIcon />} onClick={addLineItem} sx={{ mt: 1 }}>Add Line Item</Button>

                  <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Typography>Subtotal: ${calculateSubtotal().toFixed(2)}</Typography>
                    <Typography>Tax ({(TAX_RATE * 100).toFixed(1)}%): ${calculateTax().toFixed(2)}</Typography>
                    <Typography variant="h6">Grand Total: ${calculateGrandTotal().toFixed(2)}</Typography>
                  </Box>

                  <TextField label="Notes" multiline rows={3} fullWidth value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} sx={{ mt: 2 }} />

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button variant="contained" onClick={handleSaveInvoice}>
                      {editingInvoiceId ? 'Update' : 'Save'} Invoice
                    </Button>
                    {editingInvoiceId && (
                      <>
                        <Button startIcon={<PictureAsPdfIcon />} variant="outlined" onClick={generatePDF}>
                          Download PDF
                        </Button>
                        <Button startIcon={<EmailIcon />} variant="contained" color="secondary" onClick={handleEmailInvoice}>
                          Email Invoice
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>

                {editingInvoiceId && (
                  <Box ref={invoiceRef} sx={{ bgcolor: 'white', p: 4, my: 4, border: '1px solid #ccc', borderRadius: 2 }}>
                    {/* Printable invoice content unchanged from previous version */}
                    <Typography variant="h4" align="center" gutterBottom>INVOICE</Typography>
                    {/* Company header, bill to, line items table, totals, notes, payments table */}
                    {/* (Keep the full printable section from previous code) */}
                  </Box>
                )}

                <Typography variant="h6" gutterBottom>Existing Invoices</Typography>
                <Table>
                  {/* Table with View/PDF, Delete, Mark Paid buttons */}
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.invoice_number}</TableCell>
                        <TableCell>{inv.customer_name}</TableCell>
                        <TableCell>{moment(inv.invoice_date).format('MM/DD/YYYY')}</TableCell>
                        <TableCell>${inv.total.toFixed(2)}</TableCell>
                        <TableCell>{inv.status}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleViewInvoice(inv)}>View</Button>
                          <Button size="small" color="error" onClick={() => handleDeleteInvoice(inv.id)}>Delete</Button>
                          {inv.status !== 'Paid' && <Button size="small" color="success" onClick={() => handleMarkPaid(inv.id)}>Mark Paid</Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <Alert severity="warning">Select a branch to manage invoices</Alert>
            )}

            {message && <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mt: 3 }}>{message}</Alert>}
          </Box>
        )}

        {/* Other tabs unchanged */}
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