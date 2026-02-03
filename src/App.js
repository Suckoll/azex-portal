// In Dashboard function, add state for modal
const [selectedEvent, setSelectedEvent] = useState(null);
const [reassignTech, setReassignTech] = useState('');

// Add technicians fetch (already have)

// In calendar JSX
<Calendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  style={{ height: '100%' }}
  draggableAccessor={() => true}  // Enable drag
  onEventDrop={({ event, start, end }) => {
    // Update date/time
    axios.put(`${API_BASE}/jobs/${event.id}`, { start, end }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        // Refresh events
        loadEvents();
      });
  }}
  onSelectEvent={(event) => setSelectedEvent(event)}  // Open modal
/>

// Reassign modal (add below calendar)
{selectedEvent && (
  <Box sx={{ mt: 2, p: 2, background: '#f0f0f0', borderRadius: 2 }}>
    <Typography variant="h6">Reassign {selectedEvent.title}</Typography>
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>New Technician</InputLabel>
      <Select value={reassignTech} onChange={(e) => setReassignTech(e.target.value)}>
        {technicians.map(t => (
          <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
    <Button variant="contained" sx={{ mt: 2 }} onClick={() => {
      axios.put(`${API_BASE}/jobs/${selectedEvent.id}`, { technician_id: reassignTech }, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          setSelectedEvent(null);
          setReassignTech('');
          loadEvents(); // Refresh
        });
    }}>
      Reassign
    </Button>
    <Button onClick={() => setSelectedEvent(null)} sx={{ mt: 2, ml: 2 }}>Cancel</Button>
  </Box>
)}