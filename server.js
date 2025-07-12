const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Ensure selfies directory exists
const selfiesDir = path.join(__dirname, 'selfies');
if (!fs.existsSync(selfiesDir)) {
  fs.mkdirSync(selfiesDir);
}
// Serve selfies statically
app.use('/selfies', express.static(selfiesDir));

app.post('/upload-selfie', (req, res) => {
  const { name, image } = req.body;
  if (!image || !image.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image data' });
  }
  // Extract extension and base64 data
  let ext = 'jpg';
  if (image.startsWith('data:image/png')) ext = 'png';
  else if (image.startsWith('data:image/jpeg')) ext = 'jpg';
  else if (image.startsWith('data:image/jpg')) ext = 'jpg';
  const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  const safeName = (name || 'unknown').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  const filename = `${Date.now()}_${safeName}.${ext}`;
  const filepath = path.join(selfiesDir, filename);
  fs.writeFile(filepath, base64Data, 'base64', err => {
    if (err) return res.status(500).json({ error: 'Failed to save image' });
    console.log(`Saved selfie: ${filename}`);
    res.json({ success: true, filename, url: `/selfies/${filename}` });
  });
});

app.get('/', (req, res) => {
  res.send('Selfie upload server running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
