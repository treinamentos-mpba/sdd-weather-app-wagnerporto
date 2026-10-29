# Backlog de Tarefas — Weather App

Derivado de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md) e rastreável à spec. A ordem segue a implementação: tipos, funções puras, services, hook, componentes, integração, testes e hardening. Todas as dependências apontam para tarefas anteriores.

## Rastreabilidade FR → Tarefas

| Requisito funcional | Tarefas de implementação | Tarefas de teste | Cobertura |
|---|---|---|---|
| **FR-01 — Buscar localidades** | T-02, T-03, T-05, T-07, T-12 | T-15, T-16, T-18, T-19, T-20, T-25, T-26 | Coberto |
| **FR-02 — Consultar condições atuais** | T-04, T-05, T-08, T-14 | T-15, T-18, T-21, T-25 | Coberto |
| **FR-03 — Consultar previsão diária** | T-02, T-04, T-05, T-09, T-14 | T-15, T-16, T-18, T-22, T-25 | Coberto |
| **FR-04 — Alternar unidade** | T-02, T-05, T-10, T-14 | T-17, T-19, T-23, T-26 | Coberto; T-17 é o teste unitário dedicado de conversão |
| **FR-05 — Comunicar estados da consulta** | T-03, T-04, T-05, T-11, T-12, T-14 | T-18, T-19, T-24, T-26 | Coberto |

Todos os requisitos funcionais da spec têm tarefas de implementação correspondentes; não há FR sem cobertura no backlog.

## Prioridade e Tamanho

**Prioridade:** P0 desbloqueia a primeira experiência utilizável ou uma condição obrigatória de release; P1 completa o MVP e sua verificação; P2 é hardening de menor urgência, mas continua obrigatório antes do release quando cobre NFR. **Tamanho:** P é uma unidade estreita; M envolve algumas mudanças/testes coordenados; G atravessa uma matriz ampla ou revisão operacional.

| Tarefa | Prioridade | Tamanho |
|---|---|---|
| T-01 | P0 | P |
| T-02 | P0 | M |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | M |
| T-06 | P1 | P |
| T-07 | P0 | M |
| T-08 | P0 | P |
| T-09 | P0 | P |
| T-10 | P0 | P |
| T-11 | P0 | P |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P1 | P |
| T-15 | P1 | M |
| T-16 | P1 | M |
| T-17 | P1 | P |
| T-18 | P1 | M |
| T-19 | P1 | M |
| T-20 | P1 | M |
| T-21 | P1 | P |
| T-22 | P1 | P |
| T-23 | P1 | P |
| T-24 | P1 | P |
| T-25 | P0 | M |
| T-26 | P1 | M |
| T-27 | P2 | G |
| T-28 | P1 | P |
| T-29 | P2 | G |
| T-30 | P2 | M |
| T-31 | P0 | P |
| T-32 | P2 | M |

## Sequência em Fatias Verticais

1. **Busca visível:** implementar T-01 a T-07, T-11 e T-12. A primeira entrega permite digitar uma localidade, selecionar um resultado e ver feedback de busca sem depender da integração visual do forecast. Validar com T-14, T-15, T-18, T-19, T-20 e T-24.
2. **Clima completo:** implementar T-08 a T-10 e T-13. A mesma cidade passa a exibir condições atuais, cinco dias e alternância de unidade. Validar com T-16, T-17, T-21, T-22 e T-23.
3. **Fluxo integrado e lançamento:** executar T-25 e T-26; depois concluir T-27 a T-32 para compatibilidade, acessibilidade, desempenho, termos e disponibilidade.

As fatias reutilizam as tarefas e suas dependências; T-13 completa o produto sem bloquear a primeira entrega visível de T-12.

## Entrega 1 — Tipos

### T-01 — Definir tipos de domínio

- **Descrição:** declarar `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `AsyncState` e `AppError` conforme o plano.
- **Critérios de aceite:**
  - `Unit` aceita somente `'celsius' | 'fahrenheit'` e os modelos têm os nomes/propriedades do plano.
  - Campos externos ausentes/inválidos aceitam `null`; o arquivo não usa `any`.
  - Temperaturas no domínio permanecem em Celsius.
  - `AsyncState` compila com `idle`, `loading`, `success`, `empty` e `error`.
  - `pnpm build` termina com código 0 sob `strict: true`.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Rastreio:** FR-01 a FR-05.
- **Tipo:** Data

## Entrega 2 — Funções Puras

### T-02 — Implementar funções puras do domínio

- **Descrição:** implementar normalização de busca, mapeamento Open-Meteo e regras de datas, WMO, atualidade e apresentação de unidade.
- **Critérios de aceite:**
  - Entrada `'  São Paulo  '` é normalizada para NFC e sem espaços externos; caractere Unicode de controle retorna inválido.
  - Ausências, `null`, `NaN` e `Infinity` viram `null`, nunca zero.
  - Forecast produz cinco datas locais ordenadas; data/campo ausente fica `null`, sem copiar dados de outra data.
  - `displayTemperature(0, 'fahrenheit')` retorna `32` e `°F`; para `null`, retorna `null`.
  - Com relógio fixo, timestamps entre `fetchedAt - 3 h` e `fetchedAt + 5 min`, inclusive, são `current`; fora da janela são `stale`; timestamp ausente/inválido é `unavailable`.
  - Códigos WMO listados na spec retornam seus rótulos pt-BR; código desconhecido é indisponível.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/openMeteo.ts`, `src/lib/weather.ts`.
- **Rastreio:** FR-01 a FR-04, AC-01.1, AC-01.6, AC-02.2, AC-03.1, AC-03.3, AC-04.2, AC-04.3, AC-05.4.
- **Tipo:** Data

## Entrega 3 — Services

### T-03 — Implementar service de geocoding

- **Descrição:** encapsular endpoint, parâmetros, timeout e erros de busca de localidades.
- **Critérios de aceite:**
  - `fetch` recebe `/v1/search` com `name`, `count=5`, `language=pt` e `format=json`.
  - Payload com seis resultados retorna no máximo cinco `City`; `results` ausente/vazio retorna lista vazia.
  - HTTP não-2xx, erro de rede, JSON inválido e timeout de 5 s produzem `AppError.kind` distintos.
  - `AbortSignal` é repassado e uma chamada ao service produz no máximo uma chamada HTTP.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Rastreio:** FR-01, FR-05, AC-01.1 a AC-01.5, AC-05.2.
- **Tipo:** Data

### T-04 — Implementar service de previsão

- **Descrição:** encapsular forecast, seus parâmetros e normalização de `WeatherData`.
- **Critérios de aceite:**
  - URL contém as coordenadas selecionadas e `current`, `daily`, `forecast_days=5`, `timezone=auto` e unidades definidas no plano.
  - Fixture de sucesso produz `WeatherData` com cidade selecionada, fuso, instante de recebimento e cinco entradas `forecast`.
  - `current` ausente resulta em `null`; campos parciais não invalidam a previsão válida.
  - HTTP não-2xx, rede, JSON inválido e timeout de 8 s produzem erros tipados; não há retry automático.
  - Abort por seleção nova não é classificado como timeout.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Rastreio:** FR-02, FR-03, FR-05, AC-02.1 a AC-02.3, AC-03.1 a AC-03.4, AC-05.4, AC-05.5.
- **Tipo:** Data

## Entrega 4 — Hook e Estado

### T-05 — Implementar hook de estado

- **Descrição:** coordenar busca, seleção, consulta, unidade e concorrência com `useReducer` local.
- **Critérios de aceite:**
  - Estado inicial de busca/clima é `idle`, sem cidade selecionada e com unidade `celsius`.
  - Busca e clima mantêm estados independentes `idle`, `loading`, `success`, `empty` e `error`.
  - Busca vazia/inválida não chama geocoding e limpa resultados anteriores.
  - Selecionar `City` chama forecast com suas coordenadas; respostas antigas após seleção nova são ignoradas.
  - Um retry chama o service exatamente uma vez; mudar unidade não chama service.
- **Dependências:** T-01, T-03, T-04.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Rastreio:** FR-01 a FR-05, AC-01.3, AC-01.5, AC-04.1 a AC-04.4, AC-05.1 a AC-05.7.
- **Tipo:** UI

## Entrega 5 — Componentes

### T-06 — Preparar estilos globais

- **Descrição:** criar estilos base responsivos e aplicar o tema dark glassmorphism conforme as instruções do projeto.
- **Critérios de aceite:**
  - Estilos usam Tailwind e os tokens definidos em `tailwind.config.js`, sem CSS inline por componente.
  - No shell de conteúdo, viewport de 320 CSS px não produz `scrollWidth > clientWidth`.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/index.css`.
- **Rastreio:** NFR-02; instruções de estilo do projeto.
- **Tipo:** UI

### T-07 — Criar busca e lista de localidades

- **Descrição:** implementar campo de busca e opções selecionáveis com desambiguação de nomes.
- **Critérios de aceite:**
  - Campo tem label acessível; Enter chama `onSearch` uma vez; resultados podem ser focados e selecionados por teclado.
  - Opções exibem nome, região e país disponíveis; coordenadas distinguem rótulos ainda repetidos.
  - Input vazio mostra “Informe o nome de uma cidade.”; caractere de controle mostra “A busca contém caracteres inválidos.”
  - Componente só chama callbacks por props e não chama `fetch`.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`, `src/components/LocationResults.tsx`.
- **Rastreio:** FR-01, NFR-03, NFR-04, AC-01.1 a AC-01.6.
- **Tipo:** UI

### T-08 — Exibir condições atuais

- **Descrição:** apresentar campos atuais, unidade, horário local e indisponibilidades individuais.
- **Critérios de aceite:**
  - Fixture preenchida renderiza temperatura, sensação térmica, condição WMO, umidade, velocidade do vento e horário local.
  - Cada campo `null` mostra “Indisponível” e os demais valores válidos permanecem no DOM.
  - `stale`/`unavailable` mostra “Dados atuais desatualizados ou indisponíveis.” e não rotula os dados como atuais.
- **Dependências:** T-01, T-05, T-06.
- **Arquivos prováveis:** `src/components/CurrentConditions.tsx`.
- **Rastreio:** FR-02, FR-05, AC-02.1 a AC-02.3, AC-05.4, AC-05.5.
- **Tipo:** UI

### T-09 — Exibir previsão diária

- **Descrição:** apresentar cinco dias locais com condição, mínima, máxima e probabilidade de precipitação.
- **Critérios de aceite:**
  - Fixture com cinco datas no fuso informado produz exatamente cinco itens na ordem local recebida.
  - Cada item exibe condição, mínima, máxima e probabilidade máxima; campo `null` mostra “Indisponível” sem copiar o valor vizinho.
  - Datas e números são formatados em `pt-BR`; não há data sexta nem duplicada.
- **Dependências:** T-01, T-05, T-06.
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`.
- **Rastreio:** FR-03, NFR-01, AC-03.1 a AC-03.4.
- **Tipo:** UI

### T-10 — Criar alternância de unidade

- **Descrição:** conectar o controle de unidade à função pura de apresentação das temperaturas.
- **Critérios de aceite:**
  - Unidade inicial é Celsius e todos os campos exibem `°C`.
  - Para valores base de `0 °C` e `20 °C`, selecionar Fahrenheit exibe `32 °F` e `68 °F`.
  - Selecionar Celsius restaura valores-base e não chama forecast novamente.
  - Controle tem nome acessível e alterna via teclado.
- **Dependências:** T-02, T-05, T-08, T-09.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`.
- **Rastreio:** FR-04, NFR-04, AC-04.1 a AC-04.4.
- **Tipo:** UI

### T-11 — Exibir feedback de requisição

- **Descrição:** renderizar loading, vazio, erro, retry e indisponibilidade sem acoplar acesso à API.
- **Critérios de aceite:**
  - Loading apresenta “Carregando...” em `role="status"` dentro de 100 ms.
  - Erro apresenta “Não foi possível obter os dados meteorológicos.” em `role="alert"` e botão “Tentar novamente”.
  - Busca vazia mostra a mensagem correspondente; resposta parcial marca o campo “Indisponível”.
  - Ativar retry chama o callback recebido por props uma vez.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `src/components/RequestFeedback.tsx`.
- **Rastreio:** FR-05, NFR-03, AC-05.1 a AC-05.5, AC-05.7.
- **Tipo:** UI

## Entrega 6 — Integração

### T-12 — Compor a aplicação e integrar a tela

- **Descrição:** criar bootstrap React e integrar a primeira fatia vertical de busca e seleção de localidade.
- **Critérios de aceite:**
  - `pnpm dev` monta a página sem erro de runtime; busca e opções de localidade ficam visíveis antes da integração do forecast.
  - Busca válida mostra as opções recebidas pelo service; selecionar uma opção envia as coordenadas correspondentes ao forecast.
  - Busca vazia, zero resultados e falha de geocoding mostram os estados de feedback corretos.
- **Dependências:** T-05, T-06, T-07, T-11.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/components/WeatherDashboard.tsx`.
- **Rastreio:** FR-01, FR-05, AC-01.1 a AC-01.6, AC-05.1 a AC-05.3.
- **Tipo:** UI

### T-13 — Integrar clima atual, previsão e unidade

- **Descrição:** completar a tela conectando condições atuais, previsão diária, alternância de unidade e atribuição Open-Meteo.
- **Critérios de aceite:**
  - Após selecionar uma cidade, a tela exibe os dados atuais e exatamente cinco datas da fixture da mesma cidade.
  - Alternar Celsius/Fahrenheit atualiza todas as temperaturas sem uma nova chamada forecast.
  - Resposta parcial e dados atuais indisponíveis mantêm visíveis os dados válidos e mostram feedback nos campos ausentes.
  - A atribuição “Dados meteorológicos: Open-Meteo” tem `href="https://open-meteo.com/"`.
- **Dependências:** T-08, T-09, T-10, T-12.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/WeatherDashboard.tsx`.
- **Rastreio:** FR-02, FR-03, FR-04, FR-05, NFR-12, AC-02.1 a AC-02.3, AC-03.1 a AC-03.4, AC-04.1 a AC-04.4.
- **Tipo:** UI

## Entrega 7 — Testes

### T-14 — Preparar setup Vitest

- **Descrição:** criar o setup Vitest referenciado pela configuração existente.
- **Critérios de aceite:**
  - `tests/setup.ts` importa `@testing-library/jest-dom/vitest` uma vez.
  - `pnpm test` inicia sem erro de setup/import ausente.
  - `toBeInTheDocument` fica disponível em teste Vitest.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/setup.ts`.
- **Rastreio:** plano, Estratégia de Testes.
- **Tipo:** Test

### T-15 — Testar mapeamento de payloads

- **Descrição:** testar mappers Open-Meteo com fixtures válidas, parciais e inválidas.
- **Critérios de aceite:**
  - Fixture geocoding mapeia `City`; `results: []` retorna lista vazia.
  - Fixture forecast verifica os valores esperados em `CurrentWeather` e `ForecastDay` pelo mesmo índice/data.
  - Ausente, `null`, `NaN`, `Infinity` ou WMO desconhecido resulta em `null`/indisponível.
  - `pnpm test -- tests/unit/lib/openMeteo.test.ts` termina com código 0 sem rede.
- **Dependências:** T-02, T-14.
- **Arquivos prováveis:** `tests/unit/lib/openMeteo.test.ts`.
- **Rastreio:** FR-01 a FR-03, AC-01.2, AC-01.5, AC-02.2, AC-03.2, AC-03.3, AC-05.5.
- **Tipo:** Test

### T-16 — Testar regras puras de clima

- **Descrição:** testar normalização, datas/fuso, frescor e códigos WMO, sem incluir conversão de temperatura.
- **Critérios de aceite:**
  - Casos verificam trim/NFC, controle, WMO desconhecido e entrada `null`.
  - Datas em `America/Sao_Paulo` atravessando horário de verão permanecem cinco dias locais consecutivos.
  - Testes de frescor fixam relógio e verificam limites inclusivos de 3 h no passado e 5 min no futuro, mais um valor fora de cada limite.
  - `pnpm test -- tests/unit/lib/weather.test.ts` termina com código 0.
- **Dependências:** T-02, T-14.
- **Arquivos prováveis:** `tests/unit/lib/weather.test.ts`.
- **Rastreio:** FR-01, FR-03, AC-01.1, AC-01.3, AC-01.6, AC-03.1.
- **Tipo:** Test

### T-17 — Testar conversão de unidade

- **Descrição:** cobrir a função pura de apresentação Celsius/Fahrenheit em testes unitários isolados.
- **Critérios de aceite:**
  - `displayTemperature(0, 'fahrenheit')` retorna `{ value: 32, label: '°F' }` e `displayTemperature(20, 'fahrenheit')` retorna `{ value: 68, label: '°F' }`.
  - Unidade Celsius retorna os valores base arredondados com label `°C`; `null` retorna valor `null` nas duas unidades.
  - Um valor fracionário verifica arredondamento ao inteiro mais próximo; o teste não usa DOM, service nem rede.
  - `pnpm test -- tests/unit/lib/temperature.test.ts` termina com código 0.
- **Dependências:** T-02, T-14.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Rastreio:** FR-04, AC-04.2, AC-04.3.
- **Tipo:** Test

### T-18 — Testar services HTTP

- **Descrição:** validar services de geocoding e previsão com `fetch` mockado.
- **Critérios de aceite:**
  - Asserções verificam URL, parâmetros exatos e payloads de sucesso dos dois endpoints.
  - Casos verificam lista vazia, HTTP 429/outro não-2xx, rede, JSON inválido, timeout 5/8 s e abort.
  - Uma chamada a cada service produz uma única chamada ao mock `fetch`.
  - `pnpm test -- tests/unit/services/openMeteo.test.ts` passa sem rede pública.
- **Dependências:** T-03, T-04, T-14.
- **Arquivos prováveis:** `tests/unit/services/openMeteo.test.ts`.
- **Rastreio:** FR-01 a FR-03, FR-05, AC-05.2, AC-05.7.
- **Tipo:** Test

### T-19 — Testar transições do hook

- **Descrição:** verificar estados e concorrência do hook com services substituídos por mocks.
- **Critérios de aceite:**
  - Testes observam todas as transições documentadas; `empty` ocorre somente para busca sem resultados.
  - Com duas promessas resolvidas fora de ordem, somente a última cidade selecionada aparece no estado.
  - Um clique de retry registra exatamente uma chamada adicional.
  - Alternar unidade preserva o modelo e não chama service.
  - `pnpm test -- tests/unit/hooks/useWeatherApp.test.tsx` termina com código 0.
- **Dependências:** T-05, T-14.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.tsx`.
- **Rastreio:** FR-01 a FR-05, AC-04.4, AC-05.6, AC-05.7.
- **Tipo:** Test

### T-20 — Testar busca e localidades

- **Descrição:** cobrir os componentes de entrada e escolha com Testing Library.
- **Critérios de aceite:**
  - Testes verificam input vazio, controle, loading, lista vazia e resultados.
  - Input vazio/controle não chama `onSearch`; Enter válido chama uma vez.
  - Fixture de homônimos rende opções distinguíveis; seleção por teclado chama `onSelect` com o `City` correto.
  - `pnpm test -- tests/unit/components/CitySearch.test.tsx tests/unit/components/LocationResults.test.tsx` termina com código 0.
- **Dependências:** T-07, T-14.
- **Arquivos prováveis:** `tests/unit/components/CitySearch.test.tsx`, `tests/unit/components/LocationResults.test.tsx`.
- **Rastreio:** FR-01, NFR-03, NFR-04, AC-01.1 a AC-01.6.
- **Tipo:** Test

### T-21 — Testar componente de condições atuais

- **Descrição:** cobrir renderização completa e parcial das condições atuais.
- **Critérios de aceite:**
  - Fixture completa verifica cada valor/unidade e horário local no DOM.
  - Fixture com campo `null` mostra “Indisponível” nesse campo e preserva os outros quatro valores.
  - `stale`/`unavailable` mostra a mensagem definida e não anuncia dados atuais.
  - `pnpm test -- tests/unit/components/CurrentConditions.test.tsx` termina com código 0.
- **Dependências:** T-08, T-14.
- **Arquivos prováveis:** `tests/unit/components/CurrentConditions.test.tsx`.
- **Rastreio:** FR-02, FR-05, AC-02.1 a AC-02.3, AC-05.4, AC-05.5.
- **Tipo:** Test

### T-22 — Testar componente de previsão

- **Descrição:** cobrir renderização das cinco datas e campos ausentes.
- **Critérios de aceite:**
  - Fixture de cinco datas produz cinco itens em ordem e datas `pt-BR`.
  - Valores renderizados correspondem à mesma data/índice da fixture.
  - Campo `null` mostra “Indisponível”, sem valor do dia anterior/seguinte.
  - `pnpm test -- tests/unit/components/DailyForecast.test.tsx` termina com código 0.
- **Dependências:** T-09, T-14.
- **Arquivos prováveis:** `tests/unit/components/DailyForecast.test.tsx`.
- **Rastreio:** FR-03, AC-03.1 a AC-03.4.
- **Tipo:** Test

### T-23 — Testar alternância de unidade

- **Descrição:** testar controle Celsius/Fahrenheit com Testing Library.
- **Critérios de aceite:**
  - Interação verifica sequência `0 °C → 32 °F → 0 °C` e labels acessíveis.
  - Callback de unidade recebe cada seleção; services não são chamados novamente.
  - `pnpm test -- tests/unit/components/TemperatureUnitToggle.test.tsx` termina com código 0.
- **Dependências:** T-10, T-14.
- **Arquivos prováveis:** `tests/unit/components/TemperatureUnitToggle.test.tsx`.
- **Rastreio:** FR-04, NFR-04, AC-04.1 a AC-04.4.
- **Tipo:** Test

### T-24 — Testar estados do componente de feedback

- **Descrição:** testar loading, vazio, erro, retry e resposta parcial do componente de feedback.
- **Critérios de aceite:**
  - Loading é encontrado em `role="status"`; erro em `role="alert"` com texto especificado.
  - Busca vazia, zero resultados e resposta parcial têm as mensagens/estados definidos.
  - Um clique no retry chama callback uma vez.
  - `pnpm test -- tests/unit/components/RequestFeedback.test.tsx` termina com código 0.
- **Dependências:** T-11, T-14.
- **Arquivos prováveis:** `tests/unit/components/RequestFeedback.test.tsx`.
- **Rastreio:** FR-05, NFR-03, AC-05.1 a AC-05.5, AC-05.7.
- **Tipo:** Test

### T-25 — Testar fluxo E2E principal em desktop e mobile

- **Descrição:** validar busca, seleção, consulta atual e previsão com rotas interceptadas.
- **Critérios de aceite:**
  - Buscar termo de fixture e selecionar resultado dispara forecast com suas coordenadas.
  - UI mostra a cidade selecionada, condições fixture e exatamente cinco datas.
  - Fixture de homônimos mostra rótulos distinguíveis antes da seleção.
  - O mesmo fluxo passa nos projetos Playwright `chromium` e `mobile`; o projeto `mobile` usa o viewport do iPhone 13 definido em `playwright.config.ts`.
  - Todas as requisições Open-Meteo são interceptadas; request não interceptado reprova o teste.
- **Dependências:** T-12, T-14.
- **Arquivos prováveis:** `tests/e2e/weather-happy-path.spec.ts`.
- **Rastreio:** FR-01 a FR-03, AC-01.5, AC-02.1, AC-03.1.
- **Tipo:** Test

### T-26 — Testar E2E de estados e unidade

- **Descrição:** validar vazio, erro, parcial, retry, concorrência e conversão no navegador.
- **Critérios de aceite:**
  - Fixtures verificam input vazio, zero resultados, erro HTTP/rede, retry e forecast parcial pelos textos/roles definidos.
  - Duas respostas de forecast resolvidas fora de ordem deixam dados da última cidade no DOM.
  - Contador forecast não aumenta ao alternar °C→°F→°C; retry aumenta o contador da rota correspondente em exatamente um.
- **Dependências:** T-12, T-14.
- **Arquivos prováveis:** `tests/e2e/weather-states.spec.ts`.
- **Rastreio:** FR-04, FR-05, AC-04.2 a AC-04.4, AC-05.1 a AC-05.7.
- **Tipo:** Test

## Entrega 8 — Hardening

### T-27 — Validar navegadores e viewports

- **Descrição:** executar os fluxos E2E na matriz responsiva e de engines definida pela spec.
- **Critérios de aceite:**
  - Playwright declara Chromium, Firefox e WebKit e executa T-25/T-26 em 320, 768, 1280 e 1920 CSS px.
  - Em cada combinação, `scrollWidth <= clientWidth` e busca, condições atuais e previsão não se sobrepõem.
  - Relatório de release registra versões de Edge, iOS Safari e Android Chrome testadas dentro da janela suportada pela spec.
- **Dependências:** T-25, T-26.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/responsive.spec.ts`.
- **Rastreio:** NFR-02, NFR-09.
- **Tipo:** Test

### T-28 — Adicionar ferramenta de auditoria acessível

- **Descrição:** adicionar `@axe-core/playwright` como dependência de desenvolvimento.
- **Critérios de aceite:**
  - Dependência aparece em `devDependencies` e `pnpm-lock.yaml` é atualizado pelo pnpm.
  - Um teste Playwright importa e executa a auditoria sem erro de módulo/configuração.
- **Dependências:** T-27.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Rastreio:** NFR-03.
- **Tipo:** Infra

### T-29 — Verificar acessibilidade WCAG

- **Descrição:** executar auditoria automática e registrar validação manual de teclado, foco e leitor de tela.
- **Critérios de aceite:**
  - Auditoria axe em T-25/T-26 retorna zero violações WCAG 2.2 AA não justificadas.
  - Checklist preenchido registra foco visível, teclado e leitura dos estados para cada navegador/dispositivo validado.
  - Violações têm correção vinculada a tarefa ou justificativa aprovada antes do release.
- **Dependências:** T-27, T-28.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`, `docs/accessibility-checklist.md`.
- **Rastreio:** NFR-03, NFR-04.
- **Tipo:** Test

### T-30 — Medir desempenho de interface

- **Descrição:** verificar metas de atualização e loading com APIs simuladas.
- **Critérios de aceite:**
  - Teste executa 100 atualizações com a mesma fixture e mede da resolução mockada até a UI atualizada.
  - Pelo menos 95 das 100 medições são menores ou iguais a 200 ms no Chromium CI.
  - Loading aparece em `role="status"` em até 100 ms; latência externa não entra na amostra.
- **Dependências:** T-25.
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`.
- **Rastreio:** NFR-05.
- **Tipo:** Test

### T-31 — Verificar termos e atribuição Open-Meteo

- **Descrição:** documentar a verificação de termos, limites de uso e atribuição antes de cada lançamento.
- **Critérios de aceite:**
  - Checklist registra data, URL consultada, resultado e responsável pela revisão.
  - A verificação confirma que o texto/link publicado corresponde às condições vigentes.
  - Gate de release falha enquanto qualquer item obrigatório estiver sem confirmação.
- **Dependências:** T-12.
- **Arquivos prováveis:** `docs/open-meteo-release-checklist.md`.
- **Rastreio:** NFR-12, Gate de Lançamento.
- **Tipo:** Infra

### T-32 — Configurar medição de disponibilidade

- **Descrição:** configurar probe externa para a aplicação hospedada e separar falhas do provedor meteorológico.
- **Critérios de aceite:**
  - Probe consulta o endereço público e mantém série mensal sucesso/falha usada para calcular a meta de 99,5%.
  - Falhas da Open-Meteo são registradas separadamente da disponibilidade da aplicação.
  - Documentação identifica URL, frequência, cálculo mensal e provedor escolhido; solução não adiciona backend ao app.
- **Dependências:** T-12; concluída antes do lançamento.
- **Arquivos prováveis:** configuração do provedor de hospedagem/monitoramento (a escolher), `docs/availability.md`.
- **Rastreio:** NFR-08.
- **Tipo:** Infra
