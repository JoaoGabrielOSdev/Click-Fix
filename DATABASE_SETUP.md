# Click-Fix Backend - Configuração do Banco de Dados

## 📋 Pré-requisitos

- PostgreSQL instalado e rodando
- Node.js v14+
- npm ou yarn

## 🔧 Configuração do Banco de Dados

### 1. **Instalar as dependências**
```bash
npm install
```

### 2. **Configurar variáveis de ambiente**

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com os dados do seu PostgreSQL:
```env
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_HOST=localhost
DB_PORT=5432
DB_NAME=click_fix
PORT=3000
NODE_ENV=development
```

### 3. **Criar o banco de dados no PostgreSQL**

No terminal do PostgreSQL:
```sql
CREATE DATABASE click_fix;
```

### 4. **Executar o schema e criar as tabelas**

```bash
npm run db:init
```

Isso irá:
- Conectar ao PostgreSQL
- Executar o arquivo `database/schema.sql`
- Criar todas as tabelas necessárias

### 5. **Iniciar o servidor**

Desenvolvimento (com auto-reload):
```bash
npm run dev
```

Produção:
```bash
npm start
```

## 📊 Estrutura do Banco de Dados

O schema inclui as seguintes tabelas:
- `usuarios` - Usuários do sistema
- `usuarios_comuns` - Detalhes de usuários comuns
- `perfis_comuns` - Perfis dos usuários comuns
- `veiculos` - Veículos cadastrados
- `empresas` - Dados das empresas
- `perfis_empresas` - Perfis das empresas
- `servicos` - Serviços oferecidos
- `horarios` - Horários de funcionamento
- `agendamentos` - Agendamentos de serviços
- `orcamentos` - Orçamentos
- `avaliacoes` - Avaliações de serviços

## 🔐 Segurança

- ⚠️ Nunca commit o arquivo `.env` (está no `.gitignore`)
- Use senhas fortes para o PostgreSQL
- Em produção, use variáveis de ambiente do servidor

## 🧪 Testar a conexão

Você pode verificar se a conexão está funcionando executando:
```bash
npm start
```

Se ver a mensagem "✓ Conectado ao PostgreSQL com sucesso!", tudo está funcionando!

## 📝 Notas

- A conexão usa um pool de conexões para melhor performance
- Em caso de erro, verifique as credenciais no `.env`
- Certifique-se de que o PostgreSQL está rodando
