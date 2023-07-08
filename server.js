const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3333;
const notesDB = path.join(__dirname, 'db', 'db.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
  });

  app.get('/api/notes', (req, res) => {
    fs.readFile(notesDB, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error retrieving notes' });
      }
      const notes = JSON.parse(data);
      return res.json(notes);
    });
  });
  
  app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    if (!title || !text) {
      return res.status(400).json({ error: 'Title and text are required' });
    }
    fs.readFile(notesDB, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error saving note' });
      }
      const notes = JSON.parse(data);
      const newNote = { id: uuidv4(), title, text };
      notes.push(newNote);
      fs.writeFile(notesDB, JSON.stringify(notes), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error saving note' });
        }
        return res.json(newNote);
      });
    });
  });
  
  app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(notesDB, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleting note' });
      }
      let notes = JSON.parse(data);
      notes = notes.filter((note) => note.id !== noteId);
      fs.writeFile(notesDB, JSON.stringify(notes), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error deleting note' });
        }
        return res.sendStatus(204);
      });
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });