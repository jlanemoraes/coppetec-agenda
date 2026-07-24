# Agenda Telefônica COPPETEC

## Banco de dados

O banco oficial versionado do projeto é:

`data/agenda.db`

O arquivo `agenda.db` localizado na raiz e os arquivos com extensão `.bak` são
cópias históricas e não devem ser usados em novas publicações.

O antigo processo de importação por `data/contatos.json` foi removido do
repositório porque não representa a agenda atual e substituía integralmente o
conteúdo da tabela. Para atualizar uma instalação existente, faça uma migração
controlada do banco.

Durante a construção da imagem, `data/agenda.db` é armazenado em
`/app/seed/agenda.db`. Na primeira inicialização de um volume vazio, o script
`docker-entrypoint.sh` copia essa semente para `/app/data/agenda.db`.

Se o volume já possuir um banco, ele é preservado para evitar perda de alterações
feitas pelo painel administrativo.

## Configuração em contêiner

- Banco em execução: `/app/data/agenda.db`
- Variável de conexão: `DATABASE_URL=jdbc:sqlite:/app/data/agenda.db`
- Senha administrativa obrigatória: variável `ADMIN_PASSWORD`
- Cookie de sessão seguro em produção: `SESSION_COOKIE_SECURE=true`
- Porta padrão da aplicação: `80`
- O manifesto em `k8s/agenda-coppetec` substitui a porta por `8080`

A senha administrativa não possui valor padrão no código. No Kubernetes, os
manifestos esperam um Secret chamado `agenda-coppetec-admin`, com a chave
`password`. Crie o Secret diretamente no ambiente de destino e não salve seu
valor no repositório.

Use uma senha longa e exclusiva. As operações de criação, edição e exclusão
exigem uma sessão administrativa válida e um token CSRF. A sessão expira após
oito horas, usa cookie `HttpOnly` com `SameSite=Strict` e deve ser transmitida
somente por HTTPS no ambiente publicado.

## Atenção ao atualizar uma instalação existente

O banco-semente é utilizado somente quando o volume está vazio. Em uma instalação
que já possua um PVC, faça backup e migre os dados existentes antes de substituir
o volume. Nunca sobrescreva um banco de produção sem uma cópia de segurança.
