const express = require('express');
const { validateEmail } = require('../utils/emailValidation');
const router = express.Router();

/**
 * Rota para validar um endereço de email
 * Endpoint: POST /api/email/validar
 * Body: { "email": "teste@gmail.com" }
 * Resposta: { "success": true/false, "message": "Mensagem de validação" }
 */
router.post('/validar', async (req, res) => {
  try {
    const { email } = req.body;

    // Validação básica do input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Validar o email usando a função de validação
    const validationResult = await validateEmail(email);

    // Retornar o resultado da validação
    res.json({
      success: validationResult.valid,
      message: validationResult.message
    });

  } catch (error) {
    console.error('Erro na rota de validação de email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;