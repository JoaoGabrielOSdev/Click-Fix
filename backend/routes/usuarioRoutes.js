const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../src/database');
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
router.post('/registro', async (req, res) => {
  const { nome, cpf, email, senha, telefone } = req.body;

  // Validação básica
  if (!nome || !cpf || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome, CPF, email e senha são obrigatórios'
    });
  }

  try {
    // Verificar se email já existe
    const emailCheck = await pool.query('SELECT id_usuario FROM usuarios WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Verificar se CPF já existe
    const cpfCheck = await pool.query('SELECT id_usuario FROM usuarios_comuns WHERE cpf = $1', [cpf]);
    if (cpfCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedSenha = await bcrypt.hash(senha, saltRounds);

    // Inserir na tabela usuarios
    const userResult = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario',
      [nome, email, hashedSenha, telefone || null, 'comum']
    );

    const userId = userResult.rows[0].id_usuario;

    // Inserir na tabela usuarios_comuns
    await pool.query(
      'INSERT INTO usuarios_comuns (id_usuario, cpf) VALUES ($1, $2)',
      [userId, cpf]
    );

    console.log('Novo registro de usuário:', { nome, email, cpf });

    res.json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      user: {
        id: userId,
        nome: nome,
        email: email,
        tipo: 'usuario'
      }
    });

  } catch (error) {
    console.error('Erro no registro de usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
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