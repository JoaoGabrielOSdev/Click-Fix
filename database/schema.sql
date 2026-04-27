DROP TABLE IF EXISTS avaliacoes        CASCADE;
DROP TABLE IF EXISTS orcamentos        CASCADE;
DROP TABLE IF EXISTS agendamentos      CASCADE;
DROP TABLE IF EXISTS horarios          CASCADE;
DROP TABLE IF EXISTS servicos          CASCADE;
DROP TABLE IF EXISTS perfis_empresas   CASCADE;
DROP TABLE IF EXISTS empresas          CASCADE;
DROP TABLE IF EXISTS veiculos          CASCADE;
DROP TABLE IF EXISTS perfis_comuns     CASCADE;
DROP TABLE IF EXISTS usuarios_comuns   CASCADE;
DROP TABLE IF EXISTS usuarios          CASCADE;

CREATE TABLE usuarios (
    id_usuario    SERIAL       PRIMARY KEY,
    nome          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    senha         VARCHAR(255) NOT NULL,              -- armazenar hash (bcrypt)
    telefone      VARCHAR(20),
    tipo_usuario  VARCHAR(10)  NOT NULL
                  CHECK (tipo_usuario IN ('comum', 'empresa')),
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios_comuns (
    id_usuario  INT         PRIMARY KEY
                REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    cpf         VARCHAR(14) NOT NULL UNIQUE,
    nascimento  DATE,
    genero      VARCHAR(20)
);

CREATE TABLE perfis_comuns (
    id_perfil    SERIAL       PRIMARY KEY,
    id_usuario   INT          NOT NULL UNIQUE
                 REFERENCES usuarios_comuns(id_usuario) ON DELETE CASCADE,
    foto_perfil  VARCHAR(255),
    bio          TEXT,
    preferencias TEXT
);

CREATE TABLE veiculos (
    placa       VARCHAR(10)  PRIMARY KEY,
    id_usuario  INT          NOT NULL
                REFERENCES usuarios_comuns(id_usuario) ON DELETE CASCADE,
    marca       VARCHAR(50)  NOT NULL,
    modelo      VARCHAR(50)  NOT NULL,
    ano         INT          NOT NULL CHECK (ano >= 1900),
    chassi      VARCHAR(50)  UNIQUE
);

CREATE TABLE empresas (
    id_empresa     SERIAL       PRIMARY KEY,
    id_usuario     INT          NOT NULL UNIQUE
                   REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    cnpj           VARCHAR(18)  NOT NULL UNIQUE,
    nome_fantasia  VARCHAR(100) NOT NULL,
    categoria      VARCHAR(50),
    localizacao    TEXT,
    endereco       TEXT
);

CREATE TABLE perfis_empresas (
    id_perfil   SERIAL       PRIMARY KEY,
    id_empresa  INT          NOT NULL UNIQUE
                REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    foto_perfil VARCHAR(255),
    bio         TEXT
);

CREATE TABLE servicos (
    id_servico    SERIAL         PRIMARY KEY,
    id_empresa    INT            NOT NULL
                  REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    nome_servico  VARCHAR(100)   NOT NULL,
    descricao     TEXT,
    preco_base    DECIMAL(10,2)  NOT NULL CHECK (preco_base >= 0),
    ativo         BOOLEAN        NOT NULL DEFAULT TRUE
);

CREATE TABLE horarios (
    id_horario  SERIAL      PRIMARY KEY,
    id_empresa  INT         NOT NULL
                REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    data_hora   TIMESTAMP   NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'disponivel'
                CHECK (status IN ('disponivel', 'agendado', 'concluido', 'cancelado')),
    UNIQUE (id_empresa, data_hora)   -- evita horário duplicado na mesma empresa
);

CREATE TABLE agendamentos (
    id_agendamento   SERIAL      PRIMARY KEY,
    id_horario       INT         NOT NULL UNIQUE
                     REFERENCES horarios(id_horario) ON DELETE RESTRICT,
    id_usuario       INT         NOT NULL
                     REFERENCES usuarios_comuns(id_usuario) ON DELETE RESTRICT,
    placa_veiculo    VARCHAR(10) NOT NULL
                     REFERENCES veiculos(placa) ON DELETE RESTRICT,
    id_servico       INT         NOT NULL
                     REFERENCES servicos(id_servico) ON DELETE RESTRICT,
    status           VARCHAR(20) NOT NULL DEFAULT 'pendente'
                     CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado')),
    data_reserva     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacoes      TEXT
);

CREATE TABLE orcamentos (
    id_orcamento    SERIAL        PRIMARY KEY,
    id_agendamento  INT           NOT NULL UNIQUE
                    REFERENCES agendamentos(id_agendamento) ON DELETE CASCADE,
    preco           DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    desconto        DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (desconto >= 0),
    preco_final     DECIMAL(10,2) GENERATED ALWAYS AS (preco - desconto) STORED,
    observacoes     TEXT,
    data_orcamento  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avaliacoes (
    id_avaliacao    SERIAL      PRIMARY KEY,
    id_agendamento  INT         NOT NULL UNIQUE
                    REFERENCES agendamentos(id_agendamento) ON DELETE CASCADE,
    id_usuario      INT         NOT NULL
                    REFERENCES usuarios_comuns(id_usuario) ON DELETE CASCADE,
    id_empresa      INT         NOT NULL
                    REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    nota            SMALLINT    NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario      TEXT,
    data_avaliacao  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_servicos_empresa     ON servicos(id_empresa);
CREATE INDEX idx_horarios_empresa     ON horarios(id_empresa);
CREATE INDEX idx_horarios_status      ON horarios(status);
CREATE INDEX idx_agendamentos_usuario ON agendamentos(id_usuario);
CREATE INDEX idx_agendamentos_status  ON agendamentos(status);
CREATE INDEX idx_avaliacoes_empresa   ON avaliacoes(id_empresa);

CREATE INDEX idx_empresas_categoria   ON empresas(categoria);

COMMENT ON TABLE usuarios          IS 'Classe base do diagrama de classes — armazena dados comuns a todos os usuários';
COMMENT ON TABLE usuarios_comuns   IS 'Especialização: usuário cliente com CPF e veículos';
COMMENT ON TABLE perfis_comuns     IS 'Perfil público do usuário comum — Edição de Perfil no fluxo';
COMMENT ON TABLE veiculos          IS 'Veículos cadastrados pelo usuário comum — Trocar Carro no fluxo';
COMMENT ON TABLE empresas          IS 'Especialização: oficinas/empresas que oferecem serviços';
COMMENT ON TABLE perfis_empresas   IS 'Perfil público da empresa — foto, bio e imagens';
COMMENT ON TABLE servicos          IS 'Catálogo de serviços oferecidos pela empresa';
COMMENT ON TABLE horarios          IS 'Slots de horário disponibilizados pela empresa';
COMMENT ON TABLE agendamentos      IS 'Vínculo usuário ↔ veículo ↔ serviço ↔ horário — núcleo do sistema';
COMMENT ON TABLE orcamentos        IS 'Orçamento associado ao agendamento — pode ser atualizado pela empresa';
COMMENT ON TABLE avaliacoes        IS 'Avaliações do usuário sobre o serviço recebido — nota de 1 a 5';
