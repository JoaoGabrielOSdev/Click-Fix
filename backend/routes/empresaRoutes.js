  const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../src/database');
const { validateEmail } = require('../utils/emailValidation');
const router = express.Router();

// Rota para login da empresa
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }

  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.email, u.senha AS hashed_senha, e.id_empresa, e.nome_fantasia
       FROM usuarios u
       JOIN empresas e ON e.id_usuario = u.id_usuario
       WHERE u.email = $1 AND u.tipo_usuario = $2`,
      [email, 'empresa']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    const empresa = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, empresa.hashed_senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      empresa: {
        id: empresa.id_empresa,
        nome: empresa.nome_fantasia,
        email: empresa.email,
        tipo: 'empresa'
      }
    });
  } catch (error) {
    console.error('Erro no login da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para registro de empresa
router.post('/registro', async (req, res) => {
  const { nomeEmpresa, cnpj, email, senha, telefone, endereco, aniversario, genero } = req.body;

  // Validação básica
  if (!nomeEmpresa || !cnpj || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome da empresa, CNPJ, email e senha são obrigatórios'
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
router.get('/perfil/:id', async (req, res) => {
  const empresaId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT e.id_empresa,
              e.nome_fantasia AS nome_empresa,
              e.cnpj,
              e.categoria,
              e.localizacao,
              e.endereco,
              u.email,
              u.telefone,
              p.foto_perfil,
              p.bio
       FROM empresas e
       JOIN usuarios u ON u.id_usuario = e.id_usuario
       LEFT JOIN perfis_empresas p ON p.id_empresa = e.id_empresa
       WHERE e.id_empresa = $1`,
      [empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    res.json({
      success: true,
      empresa: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar perfil da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar o perfil'
    });
  }
});

// Rota para atualizar perfil da empresa
router.put('/perfil/:id', async (req, res) => {
  const empresaId = req.params.id;
  const {
    nomeEmpresa,
    categoria,
    localizacao,
    endereco,
    telefone,
    bio,
    fotoPerfil
  } = req.body;

  try {
    const empresaResult = await pool.query(
      'SELECT id_usuario FROM empresas WHERE id_empresa = $1',
      [empresaId]
    );

    if (empresaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    const idUsuario = empresaResult.rows[0].id_usuario;

    await pool.query(
      `UPDATE empresas
       SET nome_fantasia = COALESCE($1, nome_fantasia),
           categoria = COALESCE($2, categoria),
           localizacao = COALESCE($3, localizacao),
           endereco = COALESCE($4, endereco)
       WHERE id_empresa = $5`,
      [nomeEmpresa, categoria, localizacao, endereco, empresaId]
    );

    await pool.query(
      `UPDATE usuarios
       SET telefone = COALESCE($1, telefone)
       WHERE id_usuario = $2`,
      [telefone, idUsuario]
    );

    await pool.query(
      `INSERT INTO perfis_empresas (id_empresa, foto_perfil, bio)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_empresa) DO UPDATE
       SET foto_perfil = EXCLUDED.foto_perfil,
           bio = EXCLUDED.bio`,
      [empresaId, fotoPerfil || null, bio || null]
    );

    res.json({
      success: true,
      message: 'Perfil da empresa atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar o perfil'
    });
  }
});

// Rota para listar empresas do usuário (para exibir no feed)
// Endpoint: GET /api/empresa/empresasUsuario/:idUsuario
router.get('/empresasUsuario/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  try {
    // Retorna nome, localização e fotos (se existirem no schema).
    // OBS: seu schema não tem fotos múltiplas; então enviamos as disponíveis.
    const result = await pool.query(
      `SELECT 
          e.id_empresa,
          e.nome_fantasia,
          e.localizacao,
          e.endereco,
          p.foto_perfil,
          p.bio
        FROM empresas e
        LEFT JOIN perfis_empresas p ON p.id_empresa = e.id_empresa
        WHERE e.id_usuario = $1`,
      [idUsuario]
    );

    const empresas = result.rows.map((row) => ({
      id_empresa: row.id_empresa,
      nome_fantasia: row.nome_fantasia,
      localizacao: row.localizacao,
      endereco: row.endereco,
      foto_perfil: row.foto_perfil,
      bio: row.bio,
      // placeholders para compatibilidade com o front (foto_1..foto_5)
      foto_1: null,
      foto_2: null,
      foto_3: null,
      foto_4: null,
      foto_5: null
    }));

    res.json({
      success: true,
      empresas
    });
  } catch (error) {
    console.error('Erro ao buscar empresas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar empresas do usuário'
    });
  }
});

// Rota para verificar se o usuário (id_usuario) tem empresa cadastrada
// Endpoint: GET /api/empresa/temEmpresa/:idUsuario
router.get('/temEmpresa/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const result = await pool.query(
      'SELECT 1 FROM empresas WHERE id_usuario = $1 LIMIT 1',
      [idUsuario]
    );

    const temEmpresa = result.rows.length > 0;

    res.json({
      success: true,
      temEmpresa
    });
  } catch (error) {
    console.error('Erro ao verificar empresa do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao verificar empresa'
    });
  }
});

module.exports = router;
