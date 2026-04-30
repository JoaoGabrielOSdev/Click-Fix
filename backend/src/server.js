const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Importar banco de dados
const db = require('./database');

// Importar rotas
const usuarioRoutes = require('../routes/usuarioRoutes');
const empresaRoutes = require('../routes/empresaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Rotas
app.use('/api/usuario', usuarioRoutes);
app.use('/api/empresa', empresaRoutes);

// Rota principal - servir a página de boas vindas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/Boas-vindas.html'));
});

// Rota para página de escolha de login
app.get('/escolha-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/Escolha-login.html'));
});

// Rota para página de escolha de registro
app.get('/escolha-registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/escolha-registro.html'));
});

app.get('/login/usuario', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/login-usuario.html'));
});

// Rota para página de login da empresa
app.get('/login/empresa', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/login-empresa.html'));
});

// Rota para página de registro do usuário
app.get('/registro/usuario', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/registro-usuario.html'));
});

// Rota para página de registro da empresa
app.get('/registro/empresa', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/pages/registro-empresa.html'));
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;