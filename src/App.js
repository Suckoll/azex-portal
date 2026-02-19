<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AZEX Digital Logbook</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo img { max-width: 100%; height: auto; max-height: 180px; }
    h2 { text-align: center; color: #1B5E20; margin: 0 0 15px 0; }
    h3 { color: #1B5E20; margin: 25px 0 10px; }
    label { display: block; margin: 15px 0 5px; font-weight: bold; }
    input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
    button { background: #1B5E20; color: white; padding: 15px; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; width: 100%; margin-top: 20px; }
    button:hover { background: #145214; }
    .success { color: green; text-align: center; margin-top: 20px; font-weight: bold; }
    .error { color: red; text-align: center; margin-top: 20px; font-weight: bold; }
    .submission-note { text-align: center; margin: 30px 0 20px; padding: 15px; background: #f0f7f0; border-left: 4px solid #1B5E20; color: #333; font-size: 15px; line-height: 1.5; }
    .logbook-section { margin: 30px 0 40px; padding: 20px; background: #f9fbf9; border: 1px solid #e0e8e0; border-radius: 8px; }
    .logbook-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 15px; }
    th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #e8f0e8; font-weight: bold; color: #1B5E20; }
    tr:hover { background: #f5f9f5; }
    .no-entries { color: #666; font-style: italic; text-align: center; padding: 20px; }
    .reset-note { font-size: 13px; color: #555; margin-top: 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://azexpest.com/wp-content/uploads/2019/03/AZEX_Xlogo_WEB-Transparent-768x498.png" alt="AZEX Pest Solutions Logo">
    </div>
    <h2>Digital Logbook</h2>
    <div id="propertyInfo" style="text-align:center; color:#1B5E20; margin-bottom:20px; font-weight:bold;"></div>

    <!-- LOGBOOK ENTRIES SECTION -->
    <div id="logbookSection" class="logbook-section">
      <h3>Recent Logbook Entries <span style="font-size:15px;font-weight:normal;">(Current Service Period)</span></h3>
      <div id="logbookList"><p style="text-align:center;color:#666;">Loading recent reports...</p></div>
      <p class="reset-note">This logbook automatically resets weekly or monthly after service is completed.</p>
    </div>

    <form id="logbookForm">
      <input type="hidden" id="property_id">
      <h3 style="margin-top:0;">Submit New Report</h3>
      
      <label>Room/Unit Number *</label>
      <input type="text" id="unit" required>
      <label>Pest Type *</label>
      <select id="pest" required>
        <option value="">Select pest...</option>
        <option value="Cockroach">Cockroach</option>
        <option value="Scorpion">Scorpion</option>
        <option value="Ant">Ant</option>
        <option value="Spider">Spider</option>
        <option value="Rodent">Rodent</option>
        <option value="Bed Bug">Bed Bug</option>
        <option value="Termite">Termite</option>
        <option value="Other">Other</option>
      </select>
      <label>Room/Area *</label>
      <select id="area" required>
        <option value="">Select area...</option>
        <option value="Kitchen">Kitchen</option>
        <option value="Bedroom">Bedroom</option>
        <option value="Bathroom">Bathroom</option>
        <option value="Living Room">Living Room</option>
        <option value="Hallway">Hallway</option>
        <option value="Garage">Garage</option>
        <option value="Exterior">Exterior</option>
        <option value="Other">Other</option>
      </select>
      <label>Description</label>
      <textarea id="description" rows="4" placeholder="Additional details..."></textarea>
      <label>Upload Photo (optional)</label>
      <input type="file" id="photo" accept="image/*">
      <label>Reporter Name *</label>
      <input type="text" id="reporter" required>
      <label>Permission to Enter? *</label>
      <select id="permission" required>
        <option value="">Select...</option>
        <option value="Yes">Yes - enter anytime</option>
        <option value="No">No - resident must be present</option>
      </select>
      <label>Unit Status *</label>
      <select id="occupied" required>
        <option value="">Select...</option>
        <option value="Occupied">Occupied</option>
        <option value="Vacant">Vacant</option>
      </select>

      <div class="submission-note">
        AZEX technicians' schedules are built daily based on logbook submissions. This allows us to allocate the appropriate time on property for each technician to complete their daily route efficiently.<br><br>
        <strong>Please submit all reports before 8:00 AM on your scheduled service date.</strong>
      </div>

      <button type="submit">Submit Report</button>
    </form>
    <div id="message"></div>
  </div>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('property');
    const propertyInfo = document.getElementById('propertyInfo');
    const logbookSection = document.getElementById('logbookSection');
    const logbookList = document.getElementById('logbookList');
    const form = document.getElementById('logbookForm');
    const message = document.getElementById('message');

    if (propertyId) {
      document.getElementById('property_id').value = propertyId;
      propertyInfo.innerHTML = `<strong>Property ID: ${propertyId}</strong>`;
      logbookSection.style.display = 'block';
      loadLogbookEntries();
    } else {
      propertyInfo.innerHTML = '<div class="error">Invalid link — contact AZEX.</div>';
      form.style.display = 'none';
      logbookSection.style.display = 'none';
    }

    async function loadLogbookEntries() {
      logbookList.innerHTML = '<p style="text-align:center;color:#666;">Loading recent reports...</p>';
      try {
        const response = await fetch(`https://azex-backend-v2.onrender.com/api/logbook?property_id=${propertyId}`);
        if (!response.ok) throw new Error();
        let data = await response.json();
        let entries = Array.isArray(data) ? data : (data.entries || data.data || []);
        if (entries.length === 0) {
          logbookList.innerHTML = '<p class="no-entries">No reports yet this service period.</p>';
          return;
        }
        entries.sort((a, b) => new Date(b.createdAt || b.date || b.timestamp) - new Date(a.createdAt || a.date || a.timestamp));
        let html = `<div class="logbook-container"><table><thead><tr><th>Date</th><th>Unit</th><th>Pest</th><th>Area</th><th>Reporter</th><th>Description</th></tr></thead><tbody>`;
        entries.forEach(entry => {
          const dateObj = new Date(entry.createdAt || entry.date || entry.timestamp);
          const dateStr = isNaN(dateObj) ? '—' : dateObj.toLocaleString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'});
          const desc = (entry.description || '').length > 65 ? (entry.description || '').substring(0,62)+'...' : (entry.description || '—');
          html += `<tr><td>${dateStr}</td><td><strong>${entry.unit || '—'}</strong></td><td>${entry.pest || '—'}</td><td>${entry.area || '—'}</td><td>${entry.reporter || '—'}</td><td>${desc}</td></tr>`;
        });
        html += '</tbody></table></div>';
        logbookList.innerHTML = html;
      } catch (err) {
        logbookList.innerHTML = '<p class="error" style="text-align:center;">Unable to load recent entries.<br>You can still submit a new report below.</p>';
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!propertyId) return;
      const formData = new FormData();
      formData.append('property_id', propertyId);
      formData.append('unit', document.getElementById('unit').value);
      formData.append('pest', document.getElementById('pest').value);
      formData.append('area', document.getElementById('area').value);
      formData.append('description', document.getElementById('description').value);
      formData.append('reporter', document.getElementById('reporter').value);
      formData.append('permission', document.getElementById('permission').value);
      formData.append('occupied', document.getElementById('occupied').value);
      if (document.getElementById('photo').files[0]) formData.append('photo', document.getElementById('photo').files[0]);

      try {
        const response = await fetch('https://azex-backend-v2.onrender.com/api/logbook', { method: 'POST', body: formData });
        if (response.ok) {
          message.innerHTML = '<div class="success">Report submitted successfully! Thank you — AZEX will respond soon.</div>';
          form.reset();
          loadLogbookEntries(); // refresh list instantly
        } else {
          message.innerHTML = '<div class="error">Submission failed. Please try again or call AZEX.</div>';
        }
      } catch (err) {
        message.innerHTML = '<div class="error">Network error. Check connection and try again.</div>';
      }
    });
  </script>
</body>
</html>