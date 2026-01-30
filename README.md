# Zenit - Sistema de Agendamento de Massoterapia

Sistema completo de agendamento para clínica de massoterapia, desenvolvido com React, TypeScript e Supabase.

## Funcionalidades

- Autenticação de usuários com e-mail e senha
- Sistema de agendamento com slots de horário inteligentes
- Gerenciamento de serviços de massoterapia
- Dashboard para visualização de agendamentos
- Interface intuitiva e responsiva
- Controle de horários disponíveis em tempo real

## Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Roteamento**: React Router v6
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Datas**: date-fns
- **Estilização**: CSS customizado com design moderno

## Estrutura do Banco de Dados

### Tabelas

1. **profiles**: Perfis dos usuários (clientes e terapeutas)
2. **services**: Serviços de massoterapia oferecidos
3. **appointments**: Agendamentos realizados

### Serviços Pré-cadastrados

- Massagem Relaxante (60 min - R$ 120,00)
- Massagem Terapêutica (60 min - R$ 150,00)
- Massagem Sueca (90 min - R$ 180,00)
- Massagem Desportiva (60 min - R$ 140,00)
- Reflexologia (45 min - R$ 100,00)

## Configuração

1. Configure as variáveis de ambiente no arquivo `.env`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

2. As migrações do banco de dados já foram aplicadas automaticamente

3. Instale as dependências:

```bash
npm install
```

## Como Usar

O servidor de desenvolvimento inicia automaticamente. Acesse a aplicação no navegador.

### Fluxo de Uso

1. **Cadastro/Login**: Crie uma conta ou faça login
2. **Dashboard**: Visualize seus agendamentos
3. **Novo Agendamento**:
   - Escolha o tipo de massagem
   - Selecione a data desejada
   - Escolha um horário disponível
   - Adicione observações (opcional)
   - Confirme o agendamento

### Horário de Funcionamento

- Segunda a Sexta: 09:00 às 18:00
- Os slots são gerados automaticamente com base na duração do serviço

## Recursos Técnicos

### Lógica de Slots de Horário

O sistema gera automaticamente os horários disponíveis:
- Verifica conflitos com agendamentos existentes
- Considera a duração de cada serviço
- Respeita o horário comercial (9h às 18h)
- Atualiza em tempo real

### Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso baseadas em autenticação
- Validação de dados no frontend e backend
- Senhas criptografadas pelo Supabase Auth

### Responsividade

- Design adaptável para desktop, tablet e mobile
- Componentes otimizados para toque
- Interface fluida e intuitiva

## Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.
