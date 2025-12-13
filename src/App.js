function Dashboard() {
  const [tab, setTab] = useState(0);
  const [bugDescription, setBugDescription] = useState('');
  const [bugPhoto, setBugPhoto] = useState(null);
  const [bugMessage, setBugMessage] = useState('');

  const logout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/';
  };

  const handleBugReport = () => {
    setBugMessage('Bug reported successfully! (demo)');
    setBugDescription('');
    setBugPhoto(null);
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
              Your system is live! Use the tabs to manage everything.
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Invoices
            </Typography>
            <Typography paragraph>
              Invoice list coming soon — pay directly in the portal.
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
            <TextField fullWidth label="Description" value={bugDescription} onChange={(e) => setBugDescription(e.target.value)} multiline rows={4} margin="normal" />
            <Input accept="image/*" type="file" onChange={(e) => setBugPhoto(e.target.files[0])} />
            <IconButton color="primary" component="label">
              <PhotoCamera />
            </IconButton>
            <Button variant="contained" onClick={handleBugReport} sx={{ mt: 2 }}>
              Submit Report
            </Button>
            {bugMessage && <Alert severity="success" sx={{ mt: 2 }}>{bugMessage}</Alert>}
          </Box>
        )}

        {tab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Payments
            </Typography>
            <Typography paragraph>
              Secure Stripe payments coming soon.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}