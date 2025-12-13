function Dashboard() {
  const [tab, setTab] = useState(0);

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
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Welcome to Your AZEX Portal
            </Typography>
            <Typography paragraph>
              Your system is live! Use the tabs to manage invoices, service history, report bugs, and make payments.
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Invoices
            </Typography>
            <Typography paragraph>
              Your invoice list will appear here (coming soon).
            </Typography>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Service History
            </Typography>
            <Typography paragraph>
              View all past services and treatments.
            </Typography>
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Report a Bug
            </Typography>
            <Typography paragraph>
              Report a new pest sighting — upload photos and get a fast response.
            </Typography>
          </Box>
        )}

        {tab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Payments
            </Typography>
            <Typography paragraph>
              Securely pay invoices with Stripe (coming soon).
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}