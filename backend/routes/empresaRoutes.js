const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../src/database');
const { validateEmail } = require('../utils/emailValidation');
const { uploadSingle, uploadMultiple, handleUpload, deleteFile } = require('../utils/upload');
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

// ─── Foto de perfil da empresa ───────────────────────────────────────────────

// POST /api/empresa/:id/foto-perfil
router.post('/:id/foto-perfil', async (req, res) => {
  try {
    await handleUpload(uploadSingle, req, res);
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }

  const empresaId = req.params.id;
  const urlFoto = `/uploads/${req.file.filename}`;

  try {
    const old = await pool.query(
      'SELECT foto_perfil FROM perfis_empresas WHERE id_empresa = $1',
      [empresaId]
    );

    if (old.rows.length > 0 && old.rows[0].foto_perfil) {
      deleteFile(old.rows[0].foto_perfil.replace('/uploads/', ''));
    }

    await pool.query(
      `INSERT INTO perfis_empresas (id_empresa, foto_perfil)
       VALUES ($1, $2)
       ON CONFLICT (id_empresa) DO UPDATE SET foto_perfil = EXCLUDED.foto_perfil`,
      [empresaId, urlFoto]
    );

    return res.json({ success: true, url: urlFoto, message: 'Foto de perfil da empresa atualizada!' });
  } catch (error) {
    console.error('Erro ao salvar foto da empresa:', error);
    deleteFile(req.file.filename);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/empresa/:id/foto-perfil
router.get('/:id/foto-perfil', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT foto_perfil FROM perfis_empresas WHERE id_empresa = $1',
      [req.params.id]
    );
    return res.json({ success: true, url: result.rows[0]?.foto_perfil || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ─── Galeria de fotos da empresa ─────────────────────────────────────────────

// POST /api/empresa/:id/galeria  — envia até 10 fotos de uma vez
router.post('/:id/galeria', async (req, res) => {
  try {
    await handleUpload(uploadMultiple, req, res);
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }

  const empresaId = req.params.id;

  try {
    // Descobre quantas fotos já existem para definir a ordem
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM fotos_empresa WHERE id_empresa = $1',
      [empresaId]
    );
    let ordem = parseInt(countResult.rows[0].count, 10);

    const inserted = [];
    for (const file of req.files) {
      const urlFoto = `/uploads/${file.filename}`;
      const result = await pool.query(
        'INSERT INTO fotos_empresa (id_empresa, url_foto, ordem) VALUES ($1, $2, $3) RETURNING *',
        [empresaId, urlFoto, ordem++]
      );
      inserted.push(result.rows[0]);
    }

    return res.json({ success: true, fotos: inserted, message: `${inserted.length} foto(s) adicionada(s) à galeria!` });
  } catch (error) {
    console.error('Erro ao salvar fotos da galeria:', error);
    req.files.forEach(f => deleteFile(f.filename));
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/empresa/:id/galeria  — lista todas as fotos
router.get('/:id/galeria', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM fotos_empresa WHERE id_empresa = $1 ORDER BY ordem ASC',
      [req.params.id]
    );
    return res.json({ success: true, fotos: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// DELETE /api/empresa/:empresaId/galeria/:fotoId  — remove uma foto
router.delete('/:empresaId/galeria/:fotoId', async (req, res) => {
  const { empresaId, fotoId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM fotos_empresa WHERE id_foto = $1 AND id_empresa = $2 RETURNING url_foto',
      [fotoId, empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Foto não encontrada' });
    }

    deleteFile(result.rows[0].url_foto.replace('/uploads/', ''));
    return res.json({ success: true, message: 'Foto removida da galeria' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router;