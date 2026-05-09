const validator = require('email-validator');
const disposableDomains = require('disposable-email-domains');
const dns = require('dns').promises;

/**
 * Função para validar um endereço de email de forma completa
 * @param {string} email - O endereço de email a ser validado
 * @returns {Promise<{valid: boolean, message: string}>} - Resultado da validação
 */
async function validateEmail(email) {
  try {
    // 1. Validar formato do email
    if (!validator.validate(email)) {
      return {
        valid: false,
        message: 'Formato de email inválido'
      };
    }

    // 2. Extrair domínio do email
    const domain = email.split('@')[1].toLowerCase();

    // 3. Verificar se é um domínio de email temporário/descartável
    if (disposableDomains.includes(domain)) {
      return {
        valid: false,
        message: 'Emails temporários não são permitidos'
      };
    }

    // 4. Verificar registros MX do domínio
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return {
          valid: false,
          message: 'Domínio do email não possui registros MX válidos'
        };
      }
    } catch (dnsError) {
      // Se não conseguir resolver MX, considerar inválido
      return {
        valid: false,
        message: 'Não foi possível verificar o domínio do email'
      };
    }

    // Se passou por todas as validações
    return {
      valid: true,
      message: 'Email válido'
    };

  } catch (error) {
    console.error('Erro na validação de email:', error);
    return {
      valid: false,
      message: 'Erro interno na validação do email'
    };
  }
}

module.exports = {
  validateEmail
};