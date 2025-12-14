import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Container, Tabs, Tab, Paper, TextField, Button as MuiButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const theme = createTheme({ palette: { primary: { main: '#1B5E20' } } });

function Dashboard() {
  const [tab, setTab] = useState(0);

  const logout = () => {
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
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
            <Tab label="Dashboard" />
            <Tab label="Invoices" />
            <Tab label="Service History" />
            <Tab label="Bug Reporting" />
            <Tab label="Payments" />
            <Tab label="Customers" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Welcome to Your AZEX Portal
            </Typography>
            <Typography paragraph>
              Your system is live! Use the tabs to manage everything.
            </Typography>
          </Box>
        )}

        {tab === 5 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Manage Customers
            </Typography>
            <Typography paragraph>
              Customer management features coming soon — add, edit, view details.
            </Typography>
          </Box>
        )}

        {/* Placeholder for other tabs */}
        {tab === 1 && <Box><Typography variant="h5">Invoices</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 2 && <Box><Typography variant="h5">Service History</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 3 && <Box><Typography variant="h5">Bug Reporting</Typography><Typography>Coming soon</Typography></Box>}
        {tab === 4 && <Box><Typography variant="h5">Payments</Typography><Typography>Coming soon</Typography></Box>}
      </Container>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;