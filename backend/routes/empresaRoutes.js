const express = require('express');
const router = express.Router();

// Rota para login da empresa
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }

  // Aqui você implementará a lógica de autenticação
  console.log('Tentativa de login da empresa:', { email });

  // Simulação de autenticação bem-sucedida
  res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    empresa: {
      id: 1,
      email: email,
      tipo: 'empresa'
    }
  });
});

// Rota para registro de empresa
router.post('/registro', (req, res) => {
  const { nomeEmpresa, cnpj, email, senha, telefone } = req.body;

  // Validação básica
  if (!nomeEmpresa || !cnpj || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome da empresa, CNPJ, email e senha são obrigatórios'
    });
  }

  // Aqui você implementará a lógica de registro
  console.log('Novo registro de empresa:', { nomeEmpresa, cnpj, email, telefone });

  // Simulação de registro bem-sucedido
  res.json({
    success: true,
    message: 'Empresa registrada com sucesso!',
    empresa: {
      id: 1,
      nomeEmpresa: nomeEmpresa,
      cnpj: cnpj,
      email: email,
      tipo: 'empresa'
    }
  });
});

// Rota para obter perfil da empresa
router.get('/perfil/:id', (req, res) => {
  const empresaId = req.params.id;

  // Aqui você buscaria a empresa no banco de dados
  console.log('Buscando perfil da empresa:', empresaId);

  // Simulação de dados da empresa
  res.json({
    success: true,
    empresa: {
      id: empresaId,
      nomeEmpresa: 'Oficina Silva Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@oficinasilva.com',
      telefone: '(11) 3333-4444',
      tipo: 'empresa'
    }
  });
});

module.exports = router;