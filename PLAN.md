# plano-de-implementação.md

## Resumo
- Criar um projeto novo, em paralelo ao sistema atual, com `Node.js + Vue.js`, usando o código atual apenas como fonte de domínio, fluxos, regras e contratos.
- Escopo deste plano: reescrever o painel principal, o backend de orquestração e os domínios locais hoje mantidos no Laravel; `halai-api` não será reimplementada.
- Regra de fronteira: tudo que hoje depende de HALAI continua como integração externa via BFF no novo backend; tudo que hoje é domínio local do Laravel deve ser portado.
- Estratégia de entrega: por menus/domínios, sempre na ordem fixa `backend -> testes de API -> frontend -> E2E -> aceite`.
- Base de dados: manter a mesma estrutura base do sistema atual para acelerar migração e reduzir risco; qualquer nova tabela deve ser compatível com convivência paralela.

## Arquitetura e contratos
- Estrutura oficial do projeto: monorepo com `apps/api`, `apps/web` e `packages/contracts`.
- Backend oficial: `NestJS + Fastify + TypeScript + Kysely + mysql2 + Redis + BullMQ + @nestjs/schedule`.
- Frontend oficial: `Vue 3 + Vite + TypeScript + Vue Router + Pinia + TanStack Query + TailwindCSS`.
- Banco oficial: `MariaDB/MySQL`, reaproveitando a estrutura base atual; Redis para fila, cache e rate limit.
- Comunicação oficial: o navegador fala apenas com o backend Node; o frontend nunca chama HALAI, Stripe ou provedores externos diretamente.
- Padrão de API: `/api/v1`, envelope único `{ ok, data, error, meta }`, contratos compartilhados em `packages/contracts` com `zod`.
- Autenticação oficial: login no backend Node; o backend autentica contra HALAI quando necessário, sincroniza usuário/contexto local, emite `access token` curto e `refresh token` longo, e armazena tokens externos apenas no servidor.
- Autorização oficial: RBAC com `superadmin`, `admin`, `user`, `manager`, `driver/motorista`, `chapa`; regras de acesso por `transportadora` centralizadas em um único guard.
- Realtime oficial: `Socket.IO` apenas para chat e mapas; demais telas usam HTTP + cache/polling.
- Tipos obrigatórios compartilhados: `AuthSession`, `TenantContext`, `TransportadoraAccessDecision`, `HalaiProxyResult<T>`, `OnboardingSessionDTO`, `FreteSearchRequest`, `FreteSearchResult`, `DriverCampaignRequest`, `BillingChargeResult`, `PublicBoardTokenDTO`.

## Implementação por fases
### Fase 0 — Fundação
- Subir o monorepo, `Docker Compose`, CI, lint, testes, variáveis de ambiente, healthchecks e observabilidade básica.
- Criar layout administrativo Vue espelhando a arquitetura de menus do sistema atual; manter a mesma informação estrutural dos menus para reduzir retrabalho funcional.
- Implementar módulo base de autenticação, refresh, sessão, tenant context, auditoria e tratamento padronizado de erro.
- Criar o cliente HALAI interno do backend Node com cache, retry, timeout, invalidação de token e logs estruturados.
- Criar o módulo Stripe interno do backend Node com webhook idempotente, ledger de cobrança e fila de retries.

### Fase 1 — Meus Dados
- Backend: `login`, `refresh`, `logout`, `me`, `profile`, `dashboard`, `subscriptions`, `payment-methods`, `token-consumption`, `password-change`, `audit-logs`.
- Frontend: login, dashboard, perfil, assinaturas, meios de pagamento, consumo de tokens, mudança de senha e shell final de navegação.
- Regra obrigatória: replicar sincronização de papéis, sessão única, expiração controlada e auditoria de login/logout.

### Fase 2 — Transportadoras, Onboarding e Billing
- Portar domínio local de onboarding, branding, billing, Stripe, waitlist, provisionamento pós-pagamento e bloqueio por plano/status.
- Backend: `transportadoras`, `branding`, `billing`, `admin/stripe`, `onboarding public`, `onboarding autenticado`, `stripe webhook`, `whatsapp plans`, `token billing`, `access guard`.
- Frontend: wizard público, wizard autenticado, telas de branding, billing da transportadora, admin Stripe e logs financeiros mínimos.
- Regras obrigatórias: checkout/setup intent, retries D+1/D+3/D+5, split transfer, e-mail de onboarding, bloqueio central de acesso por inadimplência/inatividade.

### Fase 3 — Fretes e Motoristas
- Portar o domínio iFretes hoje já absorvido no Laravel; não recriar o projeto `Hal-AI-Fretes` como serviço separado.
- Backend: `ifretes legacy`, `ifretes v2`, `internal ifretes`, `public board`, `driver map`, `driver register`, `driver click-frete`, `driver votes`, `driver ranking`, `imports`, `antt calculator`, `hierarquia de transportadora`, `meta official phone resolution`.
- Frontend: administrar fretes, lista de espera, consulta geo, mapa de fretes, mapa de motoristas, tipos de usuário, usuários, motoristas, importações e calculadora ANTT.
- Regras obrigatórias: manter filtros, limites, escopos por transportadora, token access, board público por token e regras de anti-spam/engajamento.

### Fase 4 — Integrações HALAI
- Tratar `channels`, `flow clients`, `flows`, `contacts`, `chats`, `reports/messages`, `subscriptions` e `token stats` como menus integrados, não como domínio reimplementado.
- Backend: criar endpoints próprios para o frontend e mapear internamente para HALAI; aplicar cache, paginação, normalização de resposta e tratamento consistente de token revogado/expirado.
- Frontend: reescrever telas de canais, clientes nos fluxos, fluxos, editor, contatos, chats consolidados e gráfico de mensagens.
- Regra obrigatória: o frontend não pode conhecer endpoint, token ou payload nativo da HALAI.

### Fase 5 — Call Center
- Tratar `templates`, `queues`, `agents`, `supervisors`, `campaigns` e `fastlists` como domínio híbrido: leitura/escrita externa via HALAI, mas despacho para motoristas e anti-spam continuam locais quando hoje já forem locais.
- Backend: BFF para templates/filas/agentes/supervisores/campanhas e port do domínio local de disparo de campanhas para motoristas, deduplicação por telefone, logs de contato e estado de engajamento.
- Frontend: telas de templates e filas, supervisores, filas, operadores, campanhas e listas rápidas.
- Regras obrigatórias: preview, teste de template, seleção múltipla de fretes, destinatários únicos por execução e trilha de auditoria operacional.

### Fase 6 — Hardening e Cutover
- Subir smoke tests, carga básica, observabilidade, dashboard operacional, runbooks e estratégia de fallback.
- Fazer o cutover por menu concluído, nunca por componente isolado; um menu só entra em produção quando backend, frontend, API tests e E2E estiverem fechados.
- Manter compatibilidade de schema até o desligamento do sistema atual; qualquer divergência estrutural vai para fase posterior, não para o V1.

## Testes e critérios de aceite
- Unitários obrigatórios para auth, guards, mapeamento HALAI, onboarding, billing, iFretes, ranking, campanhas e adapters externos.
- Contract tests obrigatórios para HALAI, Stripe e iFretes portado; usar fixtures gravadas e cenários de erro.
- API tests obrigatórios para autenticação, RBAC, auditoria, onboarding, billing, `ifretes v2`, board público, driver flows e campanhas.
- E2E obrigatórios por menu: login, onboarding sucesso, onboarding falha, branding, billing, frete search, mapas, cadastro de motorista, votação, campanha para motoristas, chats, templates e relatórios.
- Cenários de falha obrigatórios: token HALAI revogado, HALAI indisponível, webhook Stripe repetido, pagamento recusado, plano vencido, transportadora inativa, token público inválido e conflito de contexto por transportadora.
- Critério de pronto por fase: backend fechado, frontend fechado, sem chamadas diretas do browser a serviços externos, logs mínimos ativos e suíte de regressão verde.

## Assunções e fontes de verdade
- Assunção final deste plano: apesar da formulação inicial citar Laravel-only, a direção confirmada para o projeto novo foi `Node + Vue`.
- `halai-api` fica fora da reescrita; ela permanece dependência externa quando o menu for HALAI-driven.
- O código-fonte atual continua sendo a referência funcional e de regra de negócio; não será alterado por este plano.
- O domínio local a portar vem principalmente de [IfretesFreteService.php](/home/marcello/Documentos/www/Hal-AI%20Zap/app/Services/IfretesFreteService.php), [OnboardingService.php](/home/marcello/Documentos/www/Hal-AI%20Zap/app/Services/OnboardingService.php), [StripeTransportadoraService.php](/home/marcello/Documentos/www/Hal-AI%20Zap/app/Services/StripeTransportadoraService.php) e [HalaiApiClient.php](/home/marcello/Documentos/www/Hal-AI%20Zap/app/Services/HalaiApiClient.php).
- A arquitetura de menus a espelhar vem de [admin-layout.blade.php](/home/marcello/Documentos/www/Hal-AI%20Zap/resources/views/components/admin-layout.blade.php#L379).
- Não renomear entidades centrais nem redesenhar o schema no V1; primeiro atingir paridade operacional, depois otimizar estrutura.
