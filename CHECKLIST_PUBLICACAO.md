# Checklist de publicação — Agenda Telefônica COPPETEC

Este checklist deve ser usado em toda publicação do projeto, especialmente durante
a modernização do front-end.

## Situação atual

- [x] Modernização visual concluída e salva localmente.
- [x] Banco oficial definido como `data/agenda.db`.
- [x] Banco local revisado com 147 contatos válidos.
- [x] Correções ortográficas e de espaçamento aplicadas aos contatos.
- [x] Banco-semente configurado para instalações novas via Docker.
- [x] Banco existente é preservado quando o volume já contém `agenda.db`.
- [x] Senha administrativa removida do código e exigida via `ADMIN_PASSWORD`.
- [x] Autenticação e autorização dos endpoints administrativos validadas.
- [ ] **Bloqueador:** reconstruir e testar a imagem a partir do código atual.
- [ ] **Bloqueador:** executar homologação completa antes da publicação pública.

## Diretriz visual

- [x] Preservar a identidade institucional e o tema atual.
- [x] Manter o verde como cor principal da interface.
- [x] Manter o logo oficial da COPPETEC sem deformação, recorte ou alteração de cor.
- [x] Usar cores neutras claras no fundo e nas superfícies para favorecer a leitura.
- [x] Usar vermelho apenas para erros, exclusões e ações destrutivas.
- [x] Usar amarelo ou âmbar apenas para alertas e ações que exigem atenção.
- [ ] Garantir contraste mínimo WCAG AA para textos, botões e campos.
- [x] Evitar mudanças estéticas que descaracterizem uma ferramenta institucional.

## 1. Preparação da mudança

- [x] Definir claramente o objetivo e o escopo da publicação.
- [x] Confirmar quais arquivos serão alterados.
- [x] Criar uma cópia de segurança antes de mudanças estruturais.
- [ ] Confirmar que o banco de produção não será incluído ou sobrescrito.
- [ ] Não incluir senhas, tokens, credenciais ou dados sensíveis no código.
- [ ] Verificar se há mudanças locais não relacionadas ao escopo.
- [ ] Registrar riscos conhecidos e plano de reversão.

## 2. Validação visual

### Identidade e consistência

- [x] Conferir logo, título e cores institucionais.
- [x] Verificar consistência de tipografia, espaçamentos, bordas e sombras.
- [x] Verificar se botões primários, secundários e destrutivos são distinguíveis.
- [x] Garantir que o ramal tenha destaque visual sem competir com o nome do contato.
- [x] Conferir estados de hover, foco, ativo e desabilitado.
- [x] Evitar estilos inline e regras com `!important` quando não forem indispensáveis.

### Desktop

- [ ] Testar em 1920 × 1080.
- [ ] Testar em 1366 × 768.
- [x] Confirmar que o conteúdo não fica excessivamente largo.
- [x] Confirmar alinhamento das colunas da tabela.
- [x] Confirmar legibilidade de nomes e setores longos.
- [x] Confirmar funcionamento do cabeçalho fixo, se implementado.

### Tablet e celular

- [ ] Testar em 768 × 1024.
- [x] Testar em 390 × 844.
- [ ] Testar em 360 × 800.
- [x] Confirmar ausência de rolagem horizontal na página.
- [x] Confirmar que textos não ficam cortados ou sobrepostos.
- [x] Confirmar que botões possuem área de toque adequada.
- [x] Confirmar que o cabeçalho não ocupa espaço excessivo.
- [x] Confirmar que tabela ou cartões continuam fáceis de consultar.
- [ ] Testar orientação retrato e paisagem.

## 3. Funcionalidades públicas

- [x] A lista de contatos é carregada corretamente.
- [x] A busca funciona para gerência.
- [x] A busca funciona para setor.
- [x] A busca funciona para usuário.
- [x] A busca funciona para ramal.
- [x] A busca ignora diferenças entre maiúsculas e minúsculas.
- [x] A busca apresenta um estado claro quando não há resultados.
- [x] A limpeza da busca restaura todos os resultados.
- [ ] A ordenação funciona em todas as colunas previstas.
- [x] A interface indica qual coluna está ordenada e em qual direção.
- [x] O prefixo telefônico é exibido corretamente.
- [x] O número armazenado no banco não é modificado apenas por causa da apresentação.
- [x] A quantidade exibida de contatos corresponde aos resultados visíveis.
- [x] O carregamento apresenta feedback visual.
- [x] Falhas da API apresentam mensagem compreensível.

## 4. Funcionalidades administrativas

- [x] O modal de login abre e fecha corretamente.
- [x] O login válido autentica o administrador.
- [x] O login inválido apresenta mensagem clara sem expor detalhes internos.
- [x] O botão de logout encerra o estado administrativo.
- [x] Usuários comuns não visualizam ações administrativas.
- [x] Usuários comuns não conseguem criar, editar ou excluir via API.
- [ ] A criação de contato funciona.
- [ ] A edição de contato preserva os dados existentes.
- [x] A exclusão solicita confirmação clara.
- [x] Cancelar a exclusão não modifica dados.
- [x] Erros ao salvar ou excluir apresentam feedback adequado.
- [x] Formulários impedem envio duplicado enquanto a operação está em andamento.
- [x] Campos obrigatórios e formatos inválidos são informados antes do envio.

## 5. Acessibilidade

- [x] A página utiliza um único `head` e um único `body`.
- [x] A estrutura possui `header`, `main` e demais elementos semânticos adequados.
- [x] Existe um título principal `h1`.
- [x] Todos os campos possuem `label` associado ou nome acessível equivalente.
- [x] Todos os botões de ícone possuem nome acessível.
- [x] Cabeçalhos ordenáveis podem ser acionados pelo teclado.
- [x] A ordenação da tabela informa `aria-sort`.
- [x] O foco é claramente visível.
- [ ] A ordem de navegação por `Tab` é lógica.
- [x] Modais usam `role="dialog"` e `aria-modal="true"`.
- [x] Ao abrir um modal, o foco é movido para ele.
- [x] O foco permanece dentro do modal enquanto estiver aberto.
- [x] O modal pode ser fechado com `Escape`.
- [x] Ao fechar o modal, o foco retorna ao elemento que o abriu.
- [x] Mensagens de sucesso e erro são anunciadas por região `aria-live`.
- [ ] A página funciona com zoom de 200%.
- [x] Nenhuma informação depende exclusivamente de cor.
- [x] Movimentos e animações respeitam `prefers-reduced-motion`.

## 6. Qualidade técnica do front-end

- [x] HTML, CSS e JavaScript estão separados quando aplicável.
- [x] Imagens não estão incorporadas como Base64 sem necessidade.
- [x] Não há tags HTML duplicadas ou inválidas.
- [x] Não há erros ou avisos relevantes no console do navegador.
- [x] Não há requisições com erro 4xx ou 5xx durante o fluxo normal.
- [x] O favicon é carregado sem erro.
- [x] Dados da API são inseridos no DOM com segurança.
- [x] Conteúdo fornecido pela API não é concatenado diretamente em `innerHTML`.
- [x] Eventos são registrados com `addEventListener` quando aplicável.
- [x] Não são criados handlers inline repetidos em cada linha da tabela.
- [x] O código não depende de `MutationObserver` para corrigir layout.
- [x] Estados de carregamento, sucesso, vazio e erro estão implementados.
- [x] A aplicação continua utilizável sem animações.
- [x] Arquivos estáticos possuem nomes e organização previsíveis.

## 7. Performance

- [x] Imagens estão comprimidas e dimensionadas corretamente.
- [ ] O peso inicial dos arquivos estáticos foi verificado.
- [x] Não há recursos grandes ou duplicados dentro do HTML.
- [x] A lista extensa não causa travamentos durante busca ou ordenação.
- [x] Paginação, carregamento incremental ou virtualização foi avaliado e implementado.
- [x] A digitação na busca permanece responsiva.
- [ ] O tempo de carregamento foi comparado com a versão anterior.
- [ ] Não há mudança de layout perceptível durante o carregamento.

## 8. Back-end e integração

- [x] O projeto compila sem erros.
- [x] Os testes automatizados existentes passam.
- [x] A aplicação inicia com a configuração esperada.
- [x] A porta e as variáveis de ambiente estão alinhadas nos arquivos de configuração.
- [ ] O acesso ao SQLite funciona no ambiente de publicação.
- [x] O volume persistente aponta para `/app/data`.
- [x] Os endpoints públicos respondem conforme esperado.
- [x] Os endpoints administrativos validam autenticação e autorização.
- [x] Alterações no front não modificaram involuntariamente o contrato da API.
- [x] O artefato JAR foi reconstruído a partir do código-fonte atual.
- [x] O conteúdo de `target/classes/static` corresponde ao de
      `src/main/resources/static`.

## 9. Dados e segurança

- [ ] Existe backup recente e verificável do banco.
- [ ] O backup está armazenado fora do artefato que será substituído.
- [ ] O procedimento de restauração foi revisado.
- [x] O script de inicialização preserva um banco existente no volume.
- [ ] Logs não expõem senhas, tokens ou dados pessoais desnecessários.
- [ ] Tokens não são enviados em requisições públicas.
- [x] Operações administrativas exigem validação no servidor.
- [x] Entradas recebidas pelo servidor são validadas.
- [x] Conteúdo exibido no navegador é tratado contra injeção de HTML.
- [ ] Dependências com vulnerabilidades conhecidas foram verificadas.
- [x] O banco oficial contém 147 contatos.
- [x] Não há campos obrigatórios vazios nos contatos.
- [x] Todos os ramais possuem quatro dígitos.
- [x] Não há ramais ou usuários duplicados.
- [x] Textos e espaços excedentes identificados foram corrigidos.

## 10. Container e Kubernetes

- [ ] A imagem Docker foi construída com sucesso.
- [ ] A aplicação inicia corretamente dentro do container.
- [ ] A imagem utiliza a versão esperada do JAR.
- [ ] O container não contém backups, logs ou bancos desnecessários.
- [ ] Health checks e probes respondem corretamente.
- [ ] Requests e limits de recursos foram revisados.
- [ ] ConfigMap, Secret, PVC, Service e Deployment estão consistentes.
- [x] O PVC aponta para o local correto do banco.
- [ ] A nova imagem possui tag identificável e não ambígua.
- [ ] O manifesto referencia a nova tag.
- [ ] O rollout pode ser acompanhado.
- [ ] A versão anterior da imagem permanece disponível para rollback.

## 11. Homologação

- [ ] Publicar primeiro em ambiente de homologação.
- [ ] Executar os fluxos público e administrativo completos.
- [ ] Comparar quantidade e amostra de contatos com o banco esperado.
- [ ] Validar desktop, tablet e celular em navegador real.
- [ ] Testar ao menos Chrome e Edge.
- [ ] Registrar evidências visuais da versão homologada.
- [ ] Obter aprovação funcional.
- [ ] Obter aprovação visual.
- [ ] Confirmar janela e responsável pela publicação.

## 12. Publicação em produção

- [ ] Confirmar novamente o backup do banco.
- [ ] Confirmar artefato, imagem e tag que serão publicados.
- [ ] Registrar versão ou commit correspondente.
- [ ] Confirmar plano de rollback antes do início.
- [ ] Executar a publicação na janela combinada.
- [ ] Acompanhar o rollout até a conclusão.
- [ ] Confirmar que os pods estão prontos e estáveis.
- [ ] Confirmar que o serviço responde externamente.
- [ ] Executar o smoke test imediatamente após a publicação.
- [ ] Não encerrar a publicação enquanto houver erros novos nos logs.

## 13. Smoke test pós-publicação

- [ ] Abrir a página inicial em janela anônima.
- [ ] Confirmar logo, título, cores e layout.
- [ ] Confirmar ausência de rolagem horizontal em celular.
- [ ] Confirmar carregamento da lista.
- [ ] Pesquisar um nome conhecido.
- [ ] Pesquisar um ramal conhecido.
- [ ] Ordenar ao menos duas colunas.
- [ ] Fazer login administrativo.
- [ ] Abrir o formulário de novo contato sem necessariamente salvar.
- [ ] Editar um contato de teste autorizado.
- [ ] Validar a alteração na lista.
- [ ] Excluir somente um registro criado especificamente para teste.
- [ ] Fazer logout.
- [ ] Confirmar que ações administrativas desapareceram.
- [ ] Verificar console, rede e logs da aplicação.

## 14. Monitoramento pós-publicação

- [ ] Monitorar erros da aplicação após o rollout.
- [ ] Monitorar reinicializações de pods.
- [ ] Monitorar tempo de resposta da API.
- [ ] Verificar falhas de autenticação fora do padrão.
- [ ] Confirmar que o banco continua persistente após reinício de pod.
- [ ] Registrar problemas encontrados e ações corretivas.
- [ ] Comunicar a conclusão da publicação aos envolvidos.

## 15. Rollback

Executar rollback se ocorrer qualquer uma das situações:

- indisponibilidade da página ou API;
- perda, inconsistência ou inacessibilidade dos dados;
- impossibilidade de pesquisar contatos;
- falha geral no login administrativo;
- criação, edição ou exclusão incorreta;
- quebra grave de layout em dispositivos de uso comum;
- aumento persistente de erros no servidor.

Checklist de rollback:

- [ ] Interromper novas mudanças.
- [ ] Registrar sintomas, horário e versão afetada.
- [ ] Reverter para a imagem ou artefato anterior.
- [ ] Acompanhar a estabilização do rollout.
- [ ] Restaurar o banco somente se houver evidência de alteração indevida.
- [ ] Repetir o smoke test na versão restaurada.
- [ ] Comunicar o rollback e preservar evidências para análise.

## Registro da publicação

| Campo | Valor |
|---|---|
| Versão/commit | |
| Ambiente | |
| Data e hora | |
| Responsável técnico | |
| Responsável pela homologação | |
| Backup confirmado | |
| Artefato/imagem | |
| Resultado do smoke test | |
| Rollback necessário | |
| Observações | |
