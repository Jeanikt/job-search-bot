const express = require('express');
const cors = require('cors');
const path = require('path');
const { runJobSearch } = require('./src/jobSearchManager');
const { filterJobs } = require('./src/jobFilter');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/jobs', async (req, res) => {
  try {
    const filters = req.query;
    const jobs = await runJobSearch(filters);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});