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

function Login() {
  // (unchanged from previous version)
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
  const [techList, setTechList] = useState([]); // separate list for Technicians tab
  const [message, setMessage] = useState('');

  // Technician HR states
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

  // Customer states (unchanged, omitted for brevity)

  const token = localStorage.getItem('jwt_token');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // (branch, technician, job, customer fetches unchanged, but tech fetch now for both)

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/technicians`, headers)
        .then(res => {
          setTechnicians(res.data);
          setTechList(res.data);
        })
        .catch(err => console.error(err));
      // other fetches...
    }
  }, [token]);

  // Job fetch with customer data
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

  const handleScheduleChange = async ({ event, start, end }) => {
    const updatedEvents = events.map(e =>
      e.id === event.id
        ? { ...e, start: new Date(start), end: end ? new Date(end) : null }
        : e
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
      // refetch to revert
      const res = await axios.get(`${API_BASE}/jobs/${selectedTech}`, headers);
      // format and setEvents...
    }
  };

  // Technician HR functions
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
      } catch (err) {
        setMessage('Delete failed');
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;
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

  const filteredTechs = techList.filter(t => {
    const term = techSearch.toLowerCase();
    return t.name.toLowerCase().includes(term) ||
           (t.email || '').toLowerCase().includes(term) ||
           (t.phone || '').toLowerCase().includes(term);
  }).filter(t => !selectedBranch || t.branch_id === Number(selectedBranch));

  const dailyJobs = events
    .filter(e => e.start && moment(e.start).isSame(currentDate, 'day'))
    .sort((a, b) => a.start - b.start);

  // (logout unchanged)

  return (
    <>
      {/* AppBar unchanged */}

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
            <Tab label="Dashboard" />
            <Tab label="Calendar" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Digital Logbook" />
            <Tab label="Payments" />
            <Tab label="Customers" />
            <Tab label="Technicians" />
          </Tabs>
        </Paper>

        {/* Other tabs unchanged */}

        {tab === 1 && (
          <Box>
            {/* Technician selector unchanged */}

            {selectedTech === null ? (
              <Alert severity="info">Select a technician to view schedule</Alert>
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
                        <TableRow><TableCell colSpan={5}>No jobs scheduled today</TableCell></TableRow>
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

        {/* (other tab placeholders unchanged) */}
      </Container>
    </>
  );
}

function App() {
  // (unchanged)
}

export default App;