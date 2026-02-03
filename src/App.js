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

// Leaflet fix (unchanged)

// Constants (unchanged)

function Login() {
  // unchanged from previous version
}

function Dashboard() {
  const themeHook = useTheme();
  const isMobile = useMediaQuery(themeHook.breakpoints.down('sm'));

  // All states unchanged, but update initialNewTech
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
    payType: 'Hourly',
    hourlyRate: '',
    salary: '',
    commissionRate: '',
    employmentStatus: 'Active',
    branchId: ''
  };
  const [newTech, setNewTech] = useState(initialNewTech);

  // In handleSaveTech — update data sent to backend
  const handleSaveTech = async () => {
    // ... validation unchanged ...

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
      pay_type: newTech.payType,
      hourly_rate: newTech.payType === 'Hourly' ? parseFloat(newTech.hourlyRate) || null : null,
      salary: ['Salary', 'Salary + Commission'].includes(newTech.payType) ? parseFloat(newTech.salary) || null : null,
      commission_rate: ['Salary + Commission', 'Commission Only'].includes(newTech.payType) ? parseFloat(newTech.commissionRate) || null : null,
      employmentStatus: newTech.employmentStatus,
      branch_id: Number(newTech.branchId)
    };

    // ... rest of save logic unchanged ...
  };

  // In edit load (setNewTech)
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
    payType: t.payType || 'Hourly',
    hourlyRate: t.hourlyRate || '',
    salary: t.salary || '',
    commissionRate: t.commissionRate || '',
    employmentStatus: t.employmentStatus,
    branchId: t.branch_id
  });

  // Technicians tab JSX — replace pay rate section with this
  <Typography variant="h6" gutterBottom>Compensation</Typography>
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
    <FormControl fullWidth>
      <InputLabel>Pay Type</InputLabel>
      <Select value={newTech.payType} onChange={e => setNewTech({...newTech, payType: e.target.value})}>
        <MenuItem value="Hourly">Hourly</MenuItem>
        <MenuItem value="Salary">Salary</MenuItem>
        <MenuItem value="Salary + Commission">Salary + Commission</MenuItem>
        <MenuItem value="Commission Only">Commission Only</MenuItem>
      </Select>
    </FormControl>

    {newTech.payType === 'Hourly' && (
      <TextField label="Hourly Rate ($)" type="number" value={newTech.hourlyRate} onChange={e => setNewTech({...newTech, hourlyRate: e.target.value})} inputProps={{ step: '0.01' }} />
    )}

    {['Salary', 'Salary + Commission'].includes(newTech.payType) && (
      <TextField label="Annual Salary ($)" type="number" value={newTech.salary} onChange={e => setNewTech({...newTech, salary: e.target.value})} />
    )}

    {['Salary + Commission', 'Commission Only'].includes(newTech.payType) && (
      <TextField label="Commission Rate (%)" type="number" value={newTech.commissionRate} onChange={e => setNewTech({...newTech, commissionRate: e.target.value})} inputProps={{ step: '0.1' }} helperText="e.g., 20 for 20%" />
    )}
  </Box>

  // In technicians table, replace pay column
  <TableCell>
    {t.payType === 'Hourly' && `$${t.hourlyRate?.toFixed(2)}/hr`}
    {t.payType === 'Salary' && `$${t.salary?.toFixed(0)}/year`}
    {t.payType === 'Salary + Commission' && `$${t.salary?.toFixed(0)}/yr + ${t.commissionRate}% comm`}
    {t.payType === 'Commission Only' && `${t.commissionRate}% commission`}
  </TableCell>

  // Rest of file unchanged
}

function App() {
  // unchanged
}

export default App;