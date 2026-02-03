// Full App.js with photo features (only showing changed parts for brevity, but paste the whole thing)

function Dashboard() {
  // ... states unchanged ...

  const [employeePhoto, setEmployeePhoto] = useState(null); // For upload preview

  // In handleSaveEmployee (renamed from handleSaveTech)
  // Add photo handling if changed
  if (employeePhoto) {
    const formData = new FormData();
    formData.append('photo', employeePhoto);
    await axios.post(`${API_BASE}/employees/${editingEmployeeId || newId}/photo`, formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    });
  }

  // In Employees tab form
  <Box sx={{ textAlign: 'center', mb: 3 }}>
    <Box sx={{ width: 150, height: 150, mx: 'auto', borderRadius: '50%', overflow: 'hidden', border: '3px solid #ccc' }}>
      {newEmployee.photo ? (
        <img src={newEmployee.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Box sx={{ bgcolor: 'grey.300', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">No Photo</Typography>
        </Box>
      )}
    </Box>
    <input
      type="file"
      accept="image/*"
      onChange={e => {
        if (e.target.files[0]) {
          setEmployeePhoto(e.target.files[0]);
          setNewEmployee({...newEmployee, photo: URL.createObjectURL(e.target.files[0])});
        }
      }}
      style={{ display: 'block', mt: 2 }}
    />
    <Typography variant="caption">Upload JPG/PNG (max 2MB)</Typography>
  </Box>

  // In employee table
  <TableCell>
    {e.photo ? (
      <img src={e.photo} alt={e.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.300' }} />
    )}
  </TableCell>
  <TableCell>{e.name}</TableCell>

  // In calendar events (tooltip)
  <Calendar
    // ...
    eventPropGetter={(event) => ({
      style: {
        backgroundColor: '#1B5E20',
        color: 'white'
      }
    })}
    tooltipAccessor={(event) => (
      <Box>
        {event.employeePhoto && <img src={event.employeePhoto} alt="Tech" style={{ width: 50, height: 50, borderRadius: '50%' }} />}
        <Typography>{event.title}</Typography>
        <Typography>{event.customer?.name}</Typography>
      </Box>
    )}
  />

  // When loading employees, include photo in data
  // In fetch: res.data has 'photo' url

  // Rest unchanged
}