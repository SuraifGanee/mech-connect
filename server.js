const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const certificateDir = path.join(__dirname, 'mech-connect', 'certificate');
const vehicleDir = path.join(__dirname, 'mech-connect', 'vehicle');

[certificateDir, vehicleDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage config for certificate uploads
const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, certificateDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// Storage config for vehicle uploads
const vehicleStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, vehicleDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const uploadCertificate = multer({ storage: certificateStorage });
const uploadVehicle = multer({ storage: vehicleStorage });

// Certificate upload route
app.post('/upload-certificate', uploadCertificate.single('certificate'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = `/mech-connect/certificate/${req.file.filename}`;
  const fileData = {
    filename: req.file.filename,
    path: filePath,
    uploadedAt: new Date().toISOString(),
  };


  const uploadsLog = path.join(__dirname, 'uploads.json');
  let existingData = [];

  if (fs.existsSync(uploadsLog)) {
    const raw = fs.readFileSync(uploadsLog);
    existingData = JSON.parse(raw);
  }

  existingData.push(fileData);
  fs.writeFileSync(uploadsLog, JSON.stringify(existingData, null, 2));

  res.json(fileData);
});
app.post('/delete-certificate', (req, res) => {
  const filename = req.body.filename;
  const filePath = path.join(__dirname, 'mech-connect/certificate', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('File deletion error:', err);
      return res.status(500).json({ success: false, error: 'Deletion failed' });
    }
    res.json({ success: true });
  });
});

// Vehicle image upload route
app.post('/upload-vehicle', uploadVehicle.single('vehicleImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({ filename: req.file.filename });
});

// Serve uploaded files
app.use('/mech-connect/certificate', express.static(certificateDir));
app.use('/mech-connect/vehicle', express.static(vehicleDir));

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
