const express = require('express');
const router = express.Router();

// Rota para login do usuário
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
  // Por enquanto, vamos simular uma resposta de sucesso
  console.log('Tentativa de login do usuário:', { email });

  // Simulação de autenticação bem-sucedida
  res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    user: {
      id: 1,
      email: email,
      tipo: 'usuario'
    }
  });
});

// Rota para registro de usuário
router.post('/registro', (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  // Validação básica
  if (!nome || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome, email e senha são obrigatórios'
    });
  }

  // Aqui você implementará a lógica de registro
  console.log('Novo registro de usuário:', { nome, email, telefone });

  // Simulação de registro bem-sucedido
  res.json({
    success: true,
    message: 'Usuário registrado com sucesso!',
    user: {
      id: 1,
      nome: nome,
      email: email,
      tipo: 'usuario'
    }
  });
});

// Rota para obter perfil do usuário
router.get('/perfil/:id', (req, res) => {
  const userId = req.params.id;

  // Aqui você buscaria o usuário no banco de dados
  console.log('Buscando perfil do usuário:', userId);

  // Simulação de dados do usuário
  res.json({
    success: true,
    user: {
      id: userId,
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      tipo: 'usuario'
    }
  });
});

module.exports = router;