const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../src/database');
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
router.post('/registro', async (req, res) => {
  const { nomeEmpresa, cnpj, email, senha, telefone, endereco } = req.body;

  // Validação básica
  if (!nomeEmpresa || !cnpj || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome da empresa, CNPJ, email e senha são obrigatórios'
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

    // Verificar se CNPJ já existe
    const cnpjCheck = await pool.query('SELECT id_empresa FROM empresas WHERE cnpj = $1', [cnpj]);
    if (cnpjCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedSenha = await bcrypt.hash(senha, saltRounds);

    // Inserir na tabela usuarios
    const userResult = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario',
      [nomeEmpresa, email, hashedSenha, telefone || null, 'empresa']
    );

    const userId = userResult.rows[0].id_usuario;

    // Inserir na tabela empresas
    const empresaResult = await pool.query(
      'INSERT INTO empresas (id_usuario, cnpj, nome_fantasia, endereco) VALUES ($1, $2, $3, $4) RETURNING id_empresa',
      [userId, cnpj, nomeEmpresa, endereco || null]
    );

    const empresaId = empresaResult.rows[0].id_empresa;

    console.log('Novo registro de empresa:', { nomeEmpresa, cnpj, email });

    res.json({
      success: true,
      message: 'Empresa registrada com sucesso!',
      empresa: {
        id: empresaId,
        nome: nomeEmpresa,
        email: email,
        tipo: 'empresa'
      }
    });

  } catch (error) {
    console.error('Erro no registro de empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
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