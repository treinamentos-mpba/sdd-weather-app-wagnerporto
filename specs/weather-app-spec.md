# Especificação de Produto — Weather App

## Visão Geral

O Weather App é uma aplicação web responsiva, em pt-BR, para buscar uma localidade pelo nome e consultar suas condições atuais e a previsão diária de cinco dias. Usa Open-Meteo sem chave de API, começa em Celsius e permite alternar para Fahrenheit.

O MVP atende duas personas: viajante planejador, que organiza atividades com antecedência, e decisor do dia a dia, que consulta condições antes de sair. A busca cobre localidades globais; uma consulta meteorológica por vez. Não há autenticação, GPS, instalação nativa ou persistência no servidor. A unidade escolhida vale somente até a página ser recarregada.

## Requisitos Funcionais

- **FR-01 — Buscar localidades:** ao enviar um nome não vazio, consultar o geocoding global da Open-Meteo e apresentar no máximo cinco resultados selecionáveis. Remover espaços externos, normalizar Unicode em NFC e preservar acentos, apóstrofos e hífens. Rejeitar caracteres de controle com a mensagem “A busca contém caracteres inválidos.” Cada opção identifica nome, região administrativa e país quando disponíveis; coordenadas distinguem rótulos ainda duplicados. A consulta meteorológica só começa após seleção.
- **FR-02 — Consultar condições atuais:** para a localidade selecionada, apresentar temperatura, sensação térmica, condição meteorológica, umidade relativa e velocidade do vento. Mostrar também o horário local dos dados. Unidades: °C, %, km/h. Campo ausente ou inválido é marcado individualmente como indisponível.
- **FR-03 — Consultar previsão diária:** apresentar exatamente hoje e os quatro dias seguintes no fuso horário retornado para a localidade. Para cada dia, apresentar condição, mínima, máxima e probabilidade máxima de precipitação; valores ausentes são marcados como indisponíveis.
- **FR-04 — Alternar unidade:** usar Celsius por padrão em cada carregamento da página. Fahrenheit afeta todas as temperaturas atuais e previstas, sem alterar os dados meteorológicos de origem, cidade ou datas.
- **FR-05 — Comunicar estados:** distinguir carregamento, busca vazia, ausência de resultados, erro de serviço/rede, resposta parcial e dados atuais desatualizados. Não tratar ausência ou erro como valor zero nem como dado atual válido. Permitir nova tentativa manual, sem repetição automática.

## Contrato de Dados

- **Geocoding:** `GET https://geocoding-api.open-meteo.com/v1/search`, com `name` normalizado, `count=5`, `language=pt` e `format=json`. Usar `name`, `admin1`, `country`, `latitude` e `longitude` da resposta. Lista ausente ou vazia equivale a zero resultados.
- **Previsão:** `GET https://api.open-meteo.com/v1/forecast`, com latitude e longitude da opção selecionada, `current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m`, `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`, `forecast_days=5`, `timezone=auto`, `temperature_unit=celsius`, `wind_speed_unit=kmh` e `precipitation_unit=mm`.
- Interpretar horários no fuso IANA retornado pela API. Comparar `current.time` com o instante UTC de recebimento da resposta. Dados só são atuais se o timestamp estiver entre 5 minutos no futuro e 3 horas no passado; timestamp ausente ou inválido é indisponível.
- Traduzir `weather_code` WMO para pt-BR: 0 céu limpo; 1 predominantemente limpo; 2 parcialmente nublado; 3 nublado; 45/48 nevoeiro; 51/53/55 chuvisco; 56/57 chuvisco congelante; 61/63/65 chuva; 66/67 chuva congelante; 71/73/75 neve; 77 grãos de neve; 80/81/82 pancadas de chuva; 85/86 pancadas de neve; 95 trovoada; 96/99 trovoada com granizo. Código desconhecido é indisponível.
- A aplicação chama a API diretamente pelo navegador via HTTPS. Não armazena respostas em cache persistente. Exibir atribuição visível “Dados meteorológicos: Open-Meteo”, com link para `https://open-meteo.com/`.

## Histórias de Usuário

- **US-01 (FR-01):** Como viajante planejador, quero buscar e selecionar uma cidade para consultar o clima do destino que vou visitar.
- **US-02 (FR-02):** Como decisor do dia a dia, quero consultar as condições meteorológicas atuais da cidade selecionada para decidir como me preparar antes de sair.
- **US-03 (FR-03):** Como viajante planejador, quero consultar a previsão de hoje e dos quatro dias seguintes para organizar minha semana.
- **US-04 (FR-04):** Como decisor do dia a dia, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-05 (FR-05):** Como decisor do dia a dia, quero ser informado quando a consulta estiver carregando, não encontrar resultados ou falhar para saber se posso confiar nos dados exibidos ou tentar novamente.

## Critérios de Aceite

### FR-01 — Buscar cidades

- **AC-01.1:** **Given** o campo contém um nome com espaços externos, acentos ou hífen, **When** a pessoa usuária envia a busca, **Then** a API recebe o nome sem espaços externos, normalizado em NFC e codificado como parâmetro de URL; os caracteres do nome são preservados.
- **AC-01.2:** **Given** a API retorna mais de cinco resultados, **When** a lista é exibida, **Then** são apresentadas no máximo cinco opções, cada uma com nome e país, região administrativa quando disponível, e coordenadas se o rótulo ainda colidir com outro.
- **AC-01.3:** **Given** o campo está vazio ou contém apenas espaços, **When** a pessoa usuária envia a busca, **Then** nenhuma chamada de geocoding é feita, a lista de resultados é limpa e é exibido “Informe o nome de uma cidade.”
- **AC-01.4:** **Given** a API retorna uma lista vazia, **When** a busca termina, **Then** é exibido “Nenhuma cidade encontrada.” e nenhuma chamada de previsão é feita.
- **AC-01.5:** **Given** a pessoa usuária seleciona um resultado, **When** a consulta de previsão começa, **Then** a requisição usa exatamente latitude e longitude desse resultado e a interface identifica os dados com seu nome, região e país disponíveis.
- **AC-01.6:** **Given** o nome contém um caractere Unicode de controle, **When** a pessoa usuária envia a busca, **Then** nenhuma chamada de geocoding é feita e é exibido “A busca contém caracteres inválidos.”

### FR-02 — Consultar clima atual

- **AC-02.1:** **Given** uma resposta atual com valores finitos para os cinco campos definidos em FR-02, **When** a consulta termina, **Then** cada valor é exibido junto ao rótulo e à unidade correspondentes e ao horário local de `current.time`.
- **AC-02.2:** **Given** uma resposta com um campo atual ausente, nulo ou não numérico, **When** os dados são exibidos, **Then** somente esse campo mostra “Indisponível” e os demais campos válidos permanecem visíveis.
- **AC-02.3:** **Given** a resposta não contém o objeto `current`, **When** a consulta termina, **Then** é exibido “Condições atuais indisponíveis.” e nenhum valor atual é inventado ou substituído por zero.

### FR-03 — Consultar previsão de cinco dias

- **AC-03.1:** **Given** uma resposta com cinco datas diárias e fuso IANA da cidade, **When** a previsão é exibida, **Then** aparecem as cinco datas locais consecutivas iniciando na data atual da cidade, inclusive em mudança de horário de verão, sem uma sexta data.
- **AC-03.2:** **Given** valores diários válidos, **When** cada dia é exibido, **Then** mínima, máxima, condição WMO e probabilidade de precipitação correspondem ao índice da mesma data na resposta.
- **AC-03.3:** **Given** uma data ou campo diário ausente, nulo ou inválido, **When** a previsão é exibida, **Then** a data permanece na lista e cada campo ausente mostra “Indisponível”, sem reutilizar valores de outro dia.
- **AC-03.4:** **Given** uma cidade selecionada, **When** a consulta termina, **Then** as cinco datas usam o fuso retornado pela API e os rótulos de data seguem `pt-BR`.

### FR-04 — Alternar unidade de temperatura

- **AC-04.1:** **Given** a página é carregada, **When** temperaturas ficam disponíveis, **Then** elas são exibidas em °C, independentemente de uma seleção feita antes de recarregar a página.
- **AC-04.2:** **Given** uma temperatura de origem $C$, **When** Fahrenheit é selecionado, **Then** o valor exibido é $F = C \times 9/5 + 32$, arredondado ao inteiro mais próximo, com unidade °F.
- **AC-04.3:** **Given** temperaturas exibidas em Fahrenheit, **When** Celsius é selecionado, **Then** todas as temperaturas voltam aos valores de origem em °C, arredondados ao inteiro mais próximo.
- **AC-04.4:** **Given** cidade, datas e condições exibidas, **When** a unidade é alternada, **Then** esses dados permanecem iguais e nenhuma nova requisição é enviada.

### FR-05 — Comunicar estados da consulta

- **AC-05.1:** **Given** uma requisição pendente, **When** ela começa, **Then** “Carregando...” aparece em até 100 ms em um elemento `role="status"` e desaparece quando a requisição termina.
- **AC-05.2:** **Given** um erro HTTP, erro de rede ou timeout, **When** a requisição falha, **Then** a interface encerra o carregamento, exibe “Não foi possível obter os dados meteorológicos.” em `role="alert"` e oferece o botão “Tentar novamente”.
- **AC-05.3:** **Given** uma busca sem resultados ou input vazio, **When** o estado vazio aparece, **Then** a mensagem correspondente está associada à busca e nenhum resultado antigo é apresentado como resposta atual.
- **AC-05.4:** **Given** `current.time` está mais de 3 horas antes ou mais de 5 minutos depois do instante de recebimento da resposta, ou é ausente/inválido, **When** os dados atuais são exibidos, **Then** a interface informa “Dados atuais desatualizados ou indisponíveis.” e não os identifica como atuais.
- **AC-05.5:** **Given** uma resposta parcial, **When** os dados são exibidos, **Then** valores válidos permanecem visíveis e cada campo ausente é indicado individualmente como indisponível.
- **AC-05.6:** **Given** uma pessoa usuária seleciona outra cidade enquanto uma requisição anterior está pendente, **When** a resposta antiga chega depois da nova, **Then** ela é descartada e não altera cidade nem dados apresentados.
- **AC-05.7:** **Given** uma solicitação falhou e o botão “Tentar novamente” está disponível, **When** a pessoa usuária o ativa, **Then** é feita exatamente uma nova tentativa para a mesma busca ou cidade, sem repetição automática.

## Requisitos Não Funcionais

- **NFR-01 — Localização:** toda a interface é pt-BR; datas e horas usam o fuso da localidade e números usam convenções de `pt-BR`.
- **NFR-02 — Responsividade:** suportar larguras de viewport de 320 a 1920 CSS px, em orientação retrato e paisagem, sem rolagem horizontal ou sobreposição dos fluxos principais; validar ao menos em 320, 768, 1280 e 1920 CSS px.
- **NFR-03 — Acessibilidade:** conformidade WCAG 2.2 nível AA. Todos os fluxos são operáveis por teclado; foco visível; carregamento anunciado por `role="status"` e erros por `role="alert"`.
- **NFR-04 — Interação:** busca pode ser enviada por Enter; resultados podem ser percorridos e selecionados por teclado; alternância de unidade é operável por teclado e ponteiro/toque.
- **NFR-05 — Desempenho:** com respostas da API simuladas, atualizar a interface em até 200 ms após a resposta em pelo menos 95 de 100 execuções no Chromium do CI. O indicador de carregamento aparece em até 100 ms.
- **NFR-06 — Limite de espera:** cancelar geocoding após 5 s e previsão após 8 s. Não fazer repetição automática; nova tentativa requer ação explícita da pessoa usuária.
- **NFR-07 — Atualidade:** considerar atuais somente dados cujo `current.time` esteja entre 5 minutos no futuro e 3 horas no passado, comparado ao instante UTC de recebimento da resposta; timestamp ausente ou inválido torna os dados atuais indisponíveis.
- **NFR-08 — Disponibilidade:** meta de 99,5% mensal para a aplicação hospedada, excluindo indisponibilidade da Open-Meteo. Medir a dependência externa separadamente.
- **NFR-09 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari; no mobile, as duas versões principais mais recentes de Safari no iOS e Chrome no Android.
- **NFR-10 — Privacidade:** sem contas, cookies de rastreamento, analytics ou armazenamento persistente de localização, consultas ou preferência de unidade. A consulta de cidade é enviada diretamente à Open-Meteo.
- **NFR-11 — Segurança:** usar HTTPS; enviar parâmetros por codificação de URL; nunca interpretar texto da busca ou conteúdo da API como HTML executável.
- **NFR-12 — Fonte e atribuição:** exibir a atribuição definida no Contrato de Dados e validar termos, limites de uso e condições vigentes da Open-Meteo antes do lançamento.

## Matriz de Rastreabilidade

| User Story | Acceptance Criteria | Requisitos não funcionais relevantes |
|---|---|---|
| **US-01 (FR-01)** — Buscar e selecionar uma cidade | AC-01.1, AC-01.2, AC-01.3, AC-01.4, AC-01.5, AC-01.6; AC-05.1, AC-05.2, AC-05.3, AC-05.7 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-09, NFR-10, NFR-11 |
| **US-02 (FR-02)** — Consultar condições atuais | AC-02.1, AC-02.2, AC-02.3; AC-05.1, AC-05.2, AC-05.4, AC-05.5, AC-05.6, AC-05.7 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-07, NFR-08, NFR-09, NFR-10, NFR-11, NFR-12 |
| **US-03 (FR-03)** — Consultar previsão de cinco dias | AC-03.1, AC-03.2, AC-03.3, AC-03.4; AC-05.1, AC-05.2, AC-05.5, AC-05.6, AC-05.7 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-08, NFR-09, NFR-10, NFR-11, NFR-12 |
| **US-04 (FR-04)** — Alternar unidade de temperatura | AC-04.1, AC-04.2, AC-04.3, AC-04.4 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-09, NFR-10, NFR-11 |
| **US-05 (FR-05)** — Receber estados e falhas da consulta | AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5, AC-05.6, AC-05.7 | NFR-02, NFR-03, NFR-05, NFR-06, NFR-07, NFR-08, NFR-09, NFR-10, NFR-11 |

## Casos Limite

- Busca vazia ou somente com espaços: não consultar API; exibir solicitação de entrada.
- Cidade inexistente ou resposta de geocoding vazia: exibir estado vazio; não consultar previsão.
- Nomes com acento, apóstrofo ou hífen: preservar e codificar; rejeitar caracteres Unicode de controle com mensagem específica, sem consultar a API.
- Resultado homônimo: mostrar região e país; se o rótulo ainda colidir, mostrar coordenadas.
- Resposta parcial: conservar campos válidos e marcar cada campo ausente como indisponível, sem zeros ou valores copiados de outra cidade/data.
- HTTP 429, erro HTTP, falha de rede ou timeout: encerrar carregamento, mostrar erro e permitir tentativa manual; não repetir automaticamente.
- Mudança de cidade durante uma requisição: descartar resposta antiga se a seleção atual já mudou.
- Virada do dia ou horário de verão: manter cinco datas consecutivas no calendário local retornado pela API.
- Unidade alternada enquanto a consulta está pendente: aplicar a unidade atual quando os dados chegarem, sem nova requisição.

## Premissas

- A aplicação é web responsiva e acessada por navegador; a busca é manual.
- A previsão é diária e usa o fuso horário retornado para as coordenadas selecionadas.
- A Open-Meteo fornece geocoding e previsão sem chave; o navegador chama os endpoints definidos no Contrato de Dados.
- A unidade começa em Celsius a cada carregamento e não persiste entre visitas.
- Os horários da resposta são interpretados com o fuso IANA retornado pela API.

## Riscos

- Indisponibilidade, mudança de termos, limites ou cobertura da Open-Meteo pode interromper consultas; monitorar erros e revisar condições antes de cada lançamento.
- Geocoding pode retornar localidades homônimas ou com metadados incompletos; a seleção sempre deve exibir coordenadas quando os demais rótulos colidirem.
- Dados meteorológicos podem estar ausentes ou atrasados; aplicar os limites e estados definidos em FR-02, FR-03 e FR-05.

## Fora do Escopo

- Autenticação, contas de usuário e persistência de dados no servidor.
- Favoritos, histórico de consultas, comparação de várias cidades e sincronização de preferências entre dispositivos.
- Alertas meteorológicos, notificações push, mapas e dados históricos.
- Localização automática por GPS como requisito obrigatório.
- Aplicativo nativo ou instalável.
- Idiomas além de pt-BR no escopo inicial.

## Gate de Lançamento

- Antes de publicar, confirmar os termos, limites de uso e requisitos de atribuição vigentes da Open-Meteo. O lançamento fica bloqueado até essa verificação; a atribuição permanece visível na interface.
