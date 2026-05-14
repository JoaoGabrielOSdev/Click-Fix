const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../src/database');
const { validateEmail } = require('../utils/emailValidation');
const { uploadSingle, handleUpload, deleteFile } = require('../utils/upload');
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
  const { nome, cpf, email, senha, telefone, aniversario, genero } = req.body;

  // Validação básica
  if (!nome || !cpf || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome, CPF, email e senha são obrigatórios'
    });
  }

  try {
    // Validar email
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

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
      'INSERT INTO usuarios_comuns (id_usuario, cpf, nascimento, genero) VALUES ($1, $2, $3, $4)',
      [userId, cpf, aniversario || null, genero || null]
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

// ─── Foto de perfil do usuário ───────────────────────────────────────────────

// POST /api/usuario/:id/foto-perfil  — faz upload e salva path no banco
router.post('/:id/foto-perfil', async (req, res) => {
  try {
    await handleUpload(uploadSingle, req, res);
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }

  const userId = req.params.id;
  const urlFoto = `/uploads/${req.file.filename}`;

  try {
    // Busca foto antiga para deletar do disco
    const old = await pool.query(
      'SELECT foto_perfil FROM perfis_comuns WHERE id_usuario = $1',
      [userId]
    );

    if (old.rows.length > 0 && old.rows[0].foto_perfil) {
      const oldFilename = old.rows[0].foto_perfil.replace('/uploads/', '');
      deleteFile(oldFilename);
    }

    // Upsert na tabela perfis_comuns
    await pool.query(
      `INSERT INTO perfis_comuns (id_usuario, foto_perfil)
       VALUES ($1, $2)
       ON CONFLICT (id_usuario) DO UPDATE SET foto_perfil = EXCLUDED.foto_perfil`,
      [userId, urlFoto]
    );

    return res.json({ success: true, url: urlFoto, message: 'Foto de perfil atualizada!' });
  } catch (error) {
    console.error('Erro ao salvar foto do usuário:', error);
    deleteFile(req.file.filename);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/usuario/:id/foto-perfil  — retorna a URL da foto atual
router.get('/:id/foto-perfil', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT foto_perfil FROM perfis_comuns WHERE id_usuario = $1',
      [req.params.id]
    );

    const url = result.rows[0]?.foto_perfil || null;
    return res.json({ success: true, url });
  } catch (error) {
    console.error('Erro ao buscar foto do usuário:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router;