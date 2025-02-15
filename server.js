const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { runJobSearch } = require('./src/jobSearchManager');
const { filterJobs } = require('./src/jobFilter');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Busca de Vagas',
      version: '1.0.0',
      description: 'API para buscar e filtrar vagas de emprego',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Busca vagas de emprego
 *     description: Retorna uma lista de vagas de emprego com base nos filtros fornecidos
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filtro por título da vaga
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filtro por nome da empresa
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtro por localização
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filtro por fonte da vaga (ex: LinkedIn, Indeed, etc.)
 *     responses:
 *       200:
 *         description: Lista de vagas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   company:
 *                     type: string
 *                   location:
 *                     type: string
 *                   url:
 *                     type: string
 *                   source:
 *                     type: string
 *       500:
 *         description: Erro ao buscar vagas
 */
app.get('/api/jobs', async (req, res) => {
  try {
    const filters = req.query;
    const jobs = await runJobSearch(filters);
    res.json(jobs);
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
});

/**
 * @swagger
 * /api/filter:
 *   post:
 *     summary: Filtra vagas de emprego
 *     description: Filtra uma lista de vagas de emprego com base nos critérios fornecidos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     company:
 *                       type: string
 *                     location:
 *                       type: string
 *                     url:
 *                       type: string
 *                     source:
 *                       type: string
 *               filters:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   company:
 *                     type: string
 *                   location:
 *                     type: string
 *                   source:
 *                     type: string
 *     responses:
 *       200:
 *         description: Lista de vagas filtradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   company:
 *                     type: string
 *                   location:
 *                     type: string
 *                   url:
 *                     type: string
 *                   source:
 *                     type: string
 *       400:
 *         description: Dados inválidos fornecidos
 */
app.post('/api/filter', (req, res) => {
  const { jobs, filters } = req.body;

  if (!Array.isArray(jobs) || typeof filters !== 'object') {
    return res.status(400).json({ error: 'Dados inválidos fornecidos' });
  }

  const filteredJobs = filterJobs(jobs, filters);
  res.json(filteredJobs);
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial
 *     description: Retorna a página HTML inicial da aplicação
 *     responses:
 *       200:
 *         description: Página HTML
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Documentação Swagger disponível em http://localhost:${port}/api-docs`);
});