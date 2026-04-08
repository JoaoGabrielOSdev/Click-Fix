<?php

// Configurações de conexão
$host = 'localhost';
$dbname = 'agendamento_automotivo';
$user = 'seu_usuario';
$password = 'sua_senha';

try {
    // Conexão via PDO focada em PostgreSQL
    $dsn = "pgsql:host=$host;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    echo "Conexão realizada com sucesso!\n";

    // Array contendo todas as queries de criação de tabelas
    $tabelas = [
        "CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            telefone VARCHAR(20),
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('comum', 'empresa'))
        );",

        "CREATE TABLE IF NOT EXISTS usuarios_comuns (
            id_usuario INT PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
            cpf VARCHAR(14) UNIQUE NOT NULL,
            nascimento DATE,
            genero VARCHAR(20)
        );",

        "CREATE TABLE IF NOT EXISTS perfis_comuns (
            id_perfil SERIAL PRIMARY KEY,
            id_usuario INT UNIQUE REFERENCES usuarios_comuns(id_usuario) ON DELETE CASCADE,
            foto_perfil VARCHAR(255),
            bio TEXT,
            preferencias TEXT
        );",

        "CREATE TABLE IF NOT EXISTS veiculos (
            placa VARCHAR(10) PRIMARY KEY,
            id_usuario INT REFERENCES usuarios_comuns(id_usuario) ON DELETE CASCADE,
            marca VARCHAR(50) NOT NULL,
            modelo VARCHAR(50) NOT NULL,
            ano INT NOT NULL,
            chassi VARCHAR(50) UNIQUE
        );",

        "CREATE TABLE IF NOT EXISTS empresas (
            id_empresa SERIAL PRIMARY KEY,
            id_usuario INT UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
            cnpj VARCHAR(18) UNIQUE NOT NULL,
            nome_fantasia VARCHAR(100) NOT NULL,
            categoria VARCHAR(50),
            localizacao TEXT,
            endereco TEXT
        );",

        "CREATE TABLE IF NOT EXISTS perfis_empresas (
            id_perfil SERIAL PRIMARY KEY,
            id_empresa INT UNIQUE REFERENCES empresas(id_empresa) ON DELETE CASCADE,
            foto_perfil VARCHAR(255),
            bio TEXT
        );",

        "CREATE TABLE IF NOT EXISTS servicos (
            id_servico SERIAL PRIMARY KEY,
            id_empresa INT REFERENCES empresas(id_empresa) ON DELETE CASCADE,
            nome_servico VARCHAR(100) NOT NULL,
            preco DECIMAL(10, 2) NOT NULL
        );",

        "CREATE TABLE IF NOT EXISTS horarios (
            id_horario SERIAL PRIMARY KEY,
            id_empresa INT REFERENCES empresas(id_empresa) ON DELETE CASCADE,
            data_hora TIMESTAMP NOT NULL,
            status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'agendado', 'concluido', 'cancelado'))
        );",

        "CREATE TABLE IF NOT EXISTS agendamentos (
            id_agendamento SERIAL PRIMARY KEY,
            id_horario INT UNIQUE REFERENCES horarios(id_horario) ON DELETE CASCADE,
            id_usuario INT REFERENCES usuarios_comuns(id_usuario) ON DELETE RESTRICT,
            placa_veiculo VARCHAR(10) REFERENCES veiculos(placa) ON DELETE RESTRICT,
            id_servico INT REFERENCES servicos(id_servico) ON DELETE RESTRICT,
            data_agendamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );"
    ];

    // Executa cada query de criação
    foreach ($tabelas as $sql) {
        $pdo->exec($sql);
    }

    echo "Todas as tabelas foram criadas com sucesso!\n";

} catch (PDOException $e) {
    echo "Erro no banco de dados: " . $e->getMessage() . "\n";
}
?>
