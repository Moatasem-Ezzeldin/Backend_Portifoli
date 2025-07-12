const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const dataFile = path.join(__dirname, '../data/projects.json');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET all projects
router.get('/', (req, res) => {
  fs.readFile(dataFile, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading data' });
    res.json(JSON.parse(data));
  });
});

// POST new project
router.post('/', upload.single('image'), (req, res) => {
  const { title, description, category, live, github } = req.body;
  const image = req.file ? req.file.filename : null;

  fs.readFile(dataFile, (err, data) => {
    let projects = [];
    if (!err && data.length > 0) projects = JSON.parse(data);

    const newProject = {
      id: Date.now(),
      title,
      description,
      category,
      live,
      github,
      image
    };

    projects.push(newProject);
    fs.writeFile(dataFile, JSON.stringify(projects, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error writing data' });
      res.status(201).json(newProject);
    });
  });
});

// PUT update project
router.put('/:id', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, category, live, github } = req.body;
  const newImage = req.file ? req.file.filename : null;

  fs.readFile(dataFile, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading data' });
    let projects = JSON.parse(data);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });

    const oldImage = projects[index].image;

    projects[index] = {
      ...projects[index],
      title,
      description,
      category,
      live,
      github,
      image: newImage || oldImage
    };

    fs.writeFile(dataFile, JSON.stringify(projects, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error writing data' });
      res.json(projects[index]);
    });
  });
});

// DELETE project
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile(dataFile, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading data' });
    let projects = JSON.parse(data);
    const project = projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    projects = projects.filter(p => p.id !== id);

    fs.writeFile(dataFile, JSON.stringify(projects, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error writing data' });

      if (project.image) {
        const imagePath = path.join(__dirname, '../uploads', project.image);
        fs.unlink(imagePath, () => {});
      }

      res.json({ success: true });
    });
  });
});

module.exports = router;