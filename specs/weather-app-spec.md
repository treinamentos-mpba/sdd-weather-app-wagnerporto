# Especificação de Produto — Weather App

## Visão Geral

O Weather App permitirá que uma pessoa busque uma cidade e consulte suas condições meteorológicas atuais e a previsão de cinco dias. A interface será em pt-BR, a fonte de dados será a Open-Meteo sem API key e Celsius será a unidade inicial, com opção de alternar para Fahrenheit.

O período de cinco dias inclui hoje e os quatro dias seguintes. O produto não exigirá autenticação nem persistirá dados no servidor. A especificação assume inicialmente uma aplicação acessada pelo navegador em desktop e dispositivos móveis; confirmar se haverá requisitos de instalação ou experiência nativa.

O público, o escopo geográfico da busca, os campos meteorológicos, a granularidade da previsão e as metas não funcionais ainda precisam de validação. Esses pontos permanecem explícitos em Open Questions e não devem ser tratados como decisões aprovadas.

## Requisitos Funcionais

- **FR-01 — Buscar cidades:** permitir que a pessoa usuária pesquise uma cidade pelo nome usando os dados de geocoding da Open-Meteo e selecione um resultado.
- **FR-02 — Consultar clima atual:** exibir as condições atuais para a cidade selecionada usando os dados fornecidos pela Open-Meteo.
- **FR-03 — Consultar previsão de cinco dias:** exibir a previsão para hoje e os quatro dias seguintes para a cidade selecionada. A apresentação diária ou horária ainda depende de decisão.
- **FR-04 — Alternar unidade de temperatura:** iniciar em Celsius e permitir alternar as temperaturas exibidas para Fahrenheit.
- **FR-05 — Comunicar estados da consulta:** informar carregamento, ausência de resultados, falhas e indisponibilidade ou desatualização dos dados, sem apresentar dados inválidos como se fossem atuais.

## Histórias de Usuário

- **US-01 (FR-01):** Como viajante planejador, quero buscar e selecionar uma cidade para consultar o clima do destino que vou visitar.
- **US-02 (FR-02):** Como decisor do dia a dia, quero consultar as condições meteorológicas atuais da cidade selecionada para decidir como me preparar antes de sair.
- **US-03 (FR-03):** Como viajante planejador, quero consultar a previsão de hoje e dos quatro dias seguintes para organizar minha semana.
- **US-04 (FR-04):** Como decisor do dia a dia, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-05 (FR-05):** Como decisor do dia a dia, quero ser informado quando a consulta estiver carregando, não encontrar resultados ou falhar para saber se posso confiar nos dados exibidos ou tentar novamente.

## Critérios de Aceite

### FR-01 — Buscar cidades

- **AC-01.1:** **Given** uma busca com nome de cidade não vazio e uma resposta de geocoding com resultados, **When** a pessoa usuária envia a busca, **Then** cada resultado retornado é apresentado como uma opção selecionável e nenhum resultado que não esteja na resposta é apresentado.
- **AC-01.2:** **Given** uma resposta de geocoding com duas cidades de mesmo nome e metadados de localização distintos, **When** os resultados são apresentados, **Then** as duas opções podem ser distinguidas pelo nome e pelos metadados de localização disponíveis na resposta, como região administrativa e país.
- **AC-01.3:** **Given** uma busca cujo texto contém apenas espaços, **When** a pessoa usuária a envia, **Then** a consulta não é enviada ao serviço de geocoding e nenhum resultado anterior é apresentado como resultado dessa busca.
- **AC-01.4:** **Given** uma lista de resultados de geocoding, **When** a pessoa usuária seleciona uma cidade, **Then** a consulta meteorológica usa latitude e longitude desse resultado e a interface identifica os dados com o nome da cidade selecionada.

### FR-02 — Consultar clima atual

- **AC-02.1:** **Given** uma cidade selecionada e uma resposta com dados atuais válidos, **When** a consulta termina, **Then** a interface identifica a cidade selecionada e apresenta os valores meteorológicos recebidos para os campos definidos para exibição.
- **AC-02.2:** **Given** uma consulta atual concluída sem alteração manual de unidade, **When** a interface apresenta temperaturas, **Then** cada temperatura é identificada em Celsius (°C) e corresponde ao valor em Celsius da resposta usada pela aplicação.
- **AC-02.3:** **Given** uma resposta sem dados atuais ou com um valor atual ausente ou nulo, **When** a interface apresenta o resultado, **Then** os dados indisponíveis são indicados e nenhum valor ausente é exibido como zero ou como dado atual válido.

### FR-03 — Consultar previsão de cinco dias

- **AC-03.1:** **Given** uma cidade selecionada, uma data atual e um fuso horário definidos no cenário de teste, **When** a previsão é apresentada, **Then** ela contém dados somente para a data atual e os quatro dias seguintes nesse fuso horário, sem omitir datas disponíveis nem incluir uma sexta data.
- **AC-03.2:** **Given** uma resposta de previsão com valores para as datas solicitadas, **When** a previsão é apresentada, **Then** cada período identifica sua data e os valores exibidos correspondem aos valores da resposta para a mesma data.
- **AC-03.3:** **Given** uma resposta sem dados para uma ou mais das cinco datas, **When** a previsão é apresentada, **Then** cada data sem dados é indicada como indisponível e nenhum valor ausente é substituído por zero ou por um valor de outra data.
- **AC-03.4:** **Given** uma unidade selecionada, **When** clima atual e previsão são apresentados, **Then** todas as temperaturas visíveis usam essa mesma unidade.

### FR-04 — Alternar unidade de temperatura

- **AC-04.1:** **Given** uma sessão sem unidade previamente selecionada e uma resposta com temperaturas, **When** os dados são apresentados pela primeira vez, **Then** todas as temperaturas visíveis são exibidas em Celsius (°C).
- **AC-04.2:** **Given** clima atual e previsão visíveis em Celsius, **When** a pessoa usuária seleciona Fahrenheit, **Then** todas as temperaturas visíveis passam a ser exibidas em Fahrenheit (°F), usando a conversão $F = C \times 9/5 + 32$ aplicada aos valores da mesma resposta.
- **AC-04.3:** **Given** temperaturas visíveis em Fahrenheit, **When** a pessoa usuária seleciona Celsius, **Then** todas as temperaturas visíveis voltam a corresponder aos valores em Celsius da mesma resposta.
- **AC-04.4:** **Given** cidade, datas e condições meteorológicas já apresentados, **When** a pessoa usuária alterna a unidade, **Then** cidade, datas e condições permanecem iguais; somente os valores e rótulos das temperaturas mudam.

### FR-05 — Comunicar estados da consulta

- **AC-05.1:** **Given** uma busca ou consulta meteorológica iniciada cuja resposta ainda não chegou, **When** a solicitação está pendente, **Then** a interface exibe o estado acessível “Carregando...” até a resposta ou falha da solicitação.
- **AC-05.2:** **Given** uma busca concluída com zero resultados, **When** a interface apresenta a resposta, **Then** ela exibe “Nenhuma cidade encontrada.” e não apresenta opções de resultados dessa busca.
- **AC-05.3:** **Given** uma falha HTTP, timeout ou erro de rede em uma busca ou consulta meteorológica, **When** a solicitação termina, **Then** a interface exibe “Não foi possível obter os dados meteorológicos.” e não apresenta a falha como dados válidos da solicitação.
- **AC-05.4:** **Given** dados cuja idade excede o limite máximo configurado para atualidade, **When** a interface apresenta esses dados, **Then** ela exibe “Dados meteorológicos desatualizados.” e não os identifica como atuais; dados com idade igual ou inferior ao limite não recebem esse aviso.

## Requisitos Não Funcionais

- **NFR-01 — Idioma e localização regional:** textos da interface em pt-BR. Datas, horários e números devem seguir convenções pt-BR; a apresentação do fuso horário da cidade selecionada depende da decisão registrada em Open Questions.
- **NFR-02 — Responsividade:** os fluxos de busca, consulta e troca de unidade devem estar disponíveis em telas móveis e desktop. Larguras mínimas, breakpoints e dispositivos suportados ainda precisam ser definidos.
- **NFR-03 — Acessibilidade:** controles devem ser operáveis por teclado e identificáveis por tecnologias assistivas. O nível de conformidade e os critérios de verificação ainda precisam ser definidos.
- **NFR-04 — Usabilidade:** os fluxos principais devem permitir pesquisar uma cidade, consultar seus dados e alternar a unidade sem instruções externas. Métricas e critérios de validação com usuários ainda precisam ser acordados.
- **NFR-05 — Desempenho:** o tempo de resposta deve atender a uma meta mensurável a ser definida, distinguindo o tempo da aplicação da latência da Open-Meteo.
- **NFR-06 — Atualidade dos dados:** deve haver um limite de idade acordado para considerar dados meteorológicos desatualizados. A interface deve aplicar FR-05 quando esse limite for ultrapassado.
- **NFR-07 — Disponibilidade:** definir a meta de disponibilidade e como medir separadamente indisponibilidade da aplicação e da dependência externa.
- **NFR-08 — Compatibilidade:** navegadores, sistemas operacionais e versões suportados precisam ser definidos antes da validação de release.
- **NFR-09 — Privacidade e armazenamento:** não exigir autenticação nem persistir dados no servidor. Armazenamento local de preferências não está definido e requer decisão explícita.
- **NFR-10 — Dependência de dados:** usar Open-Meteo sem API key, sujeito à confirmação de limites de uso, termos, licença e requisitos de atribuição.

## Casos Limite

- **Cidade inexistente:** quando a busca termina sem uma cidade correspondente, a aplicação informa que nenhuma cidade foi encontrada, não consulta nem exibe o clima de outra cidade e mantém a busca disponível para nova tentativa.
- **Input vazio:** quando o campo está vazio ou contém apenas espaços, a aplicação não envia uma requisição de geocoding, não substitui os resultados por dados antigos e solicita que a pessoa usuária informe uma cidade.
- **Caracteres especiais:** a aplicação preserva letras acentuadas e caracteres válidos no nome da cidade, codifica o texto ao enviá-lo à API e trata o conteúdo apenas como entrada de busca, nunca como marcação ou código executável. Espaços no início e no fim são removidos antes da consulta.
- **Falha de API:** diante de resposta HTTP de erro, erro de rede ou indisponibilidade da Open-Meteo, a aplicação encerra o estado de carregamento, informa que não foi possível obter os dados e não apresenta a resposta com falha como dados meteorológicos válidos. A ação de tentar novamente permanece disponível.
- **Timeout:** quando a requisição excede o limite de tempo configurado pelo cliente, a aplicação encerra a espera, remove o estado de carregamento, informa a falha e permite nova tentativa; uma resposta tardia dessa requisição não deve substituir dados de uma seleção mais recente.
- **Geocoding sem resultados:** quando a API de geocoding retorna uma lista vazia, a aplicação apresenta “Nenhuma cidade encontrada.”, não inicia uma consulta meteorológica e permite que a pessoa usuária edite a busca.
- **Resposta parcial:** quando a API retorna apenas parte dos campos ou períodos solicitados, a aplicação apresenta os valores válidos recebidos e identifica os campos ou períodos ausentes como indisponíveis. Não inventa valores, usa zero como substituto nem reaproveita valores de outra data ou cidade.
- Mais de uma cidade com o mesmo nome ou com nomes semelhantes.
- Cidade fora da cobertura ou com localização incompleta no serviço de geocoding.
- Limite de requisições da Open-Meteo.
- Falha de rede durante a busca ou atualização da previsão.
- Dados cuja idade exceda o limite de atualidade definido pelo produto.
- Mudança de dia no fuso horário da cidade, inclusive em transições de horário de verão, quando aplicável.
- Valores de temperatura negativos, arredondamento na conversão e valores ausentes ou inválidos.
- Troca rápida de cidade enquanto uma solicitação anterior ainda está em andamento; a resposta antiga não deve substituir dados da seleção mais recente.
- Alternância de unidade antes, durante ou depois de uma consulta.
- Viewport estreito, zoom de texto ou conteúdo longo que possa causar sobreposição ou rolagem horizontal.

## Premissas

- A busca é iniciada pela pessoa usuária; GPS não é obrigatório no escopo base.
- Uma cidade é consultada por vez; comparação e lista de cidades salvas não fazem parte do requisito atual.
- A unidade padrão é Celsius e a alternância para Fahrenheit afeta as temperaturas exibidas.
- Os cinco dias são hoje e os quatro dias seguintes; a granularidade diária ou horária ainda não foi aprovada.
- A aplicação será inicialmente uma experiência de navegador para desktop e dispositivos móveis, sujeita à confirmação do formato web versus nativo.
- A interface é em pt-BR.
- Não há autenticação nem persistência de dados no servidor.
- Open-Meteo é a fonte de geocoding e previsão, sem API key; endpoints, parâmetros e campos precisam ser definidos no contrato de integração.
- O tratamento de dados desatualizados depende de definir limite de idade e disponibilidade de timestamp na fonte.

## Riscos

- A Open-Meteo pode apresentar indisponibilidade, latência, limites de uso ou condições de atribuição não compatíveis com o produto.
- Campos, frequência de atualização e cobertura podem variar por localidade, afetando o conteúdo e a confiança dos usuários.
- Ambiguidade entre cidades pode levar a consultas para a localização errada.
- Fuso horário e granularidade ainda indefinidos podem produzir datas ou períodos incompatíveis com a expectativa da pessoa usuária.
- Metas não definidas de acessibilidade, desempenho, disponibilidade, responsividade e compatibilidade dificultam aceite objetivo e podem gerar retrabalho.
- A decisão de não persistir no servidor não define se a integração será direta pelo navegador ou intermediada por uma camada de servidor; uma escolha tardia pode exigir mudanças de arquitetura.
- A ausência de autenticação e persistência de servidor limita a implementação futura de favoritos, histórico ou preferências sincronizadas.

## Fora do Escopo

- Autenticação, contas de usuário e persistência de dados no servidor.
- Favoritos, histórico de consultas, comparação de várias cidades e sincronização de preferências entre dispositivos.
- Alertas meteorológicos, notificações push, mapas e dados históricos.
- Localização automática por GPS como requisito obrigatório.
- Aplicativo nativo instalável, até que o formato do produto seja confirmado.
- Idiomas além de pt-BR no escopo inicial.

Itens cuja inclusão ainda está em aberto não devem ser considerados aprovados apenas por aparecerem nesta lista; confirmar especialmente GPS e formato nativo nas Open Questions.

## Questões em Aberto

1. Qual será o escopo geográfico da busca e quais entradas serão aceitas: cidade, país, estado ou código postal?
2. Quais campos serão mostrados para distinguir cidades homônimas?
3. Quais campos específicos serão exibidos no clima atual e na previsão?
4. A previsão será diária ou horária? Qual fuso horário definirá as datas e os períodos?
5. Quais endpoints, parâmetros e campos da Open-Meteo serão usados? Quais limites de uso, termos e requisitos de atribuição se aplicam?
6. O navegador chamará a Open-Meteo diretamente ou haverá uma camada de servidor sem persistência? Haverá cache e qual será sua duração?
7. A unidade selecionada deve persistir entre visitas? É permitido armazená-la localmente no dispositivo?
8. GPS fará parte do produto? Como será solicitado consentimento e mantida uma alternativa de busca manual?
9. Qual idade máxima torna os dados desatualizados? A fonte oferece timestamp suficiente para aplicar esse limite?
10. Como tratar falhas da API, ausência de conexão e respostas parciais: nova tentativa, cache ou apenas aviso?
11. Quais metas mensuráveis de desempenho, disponibilidade, responsividade e usabilidade devem ser atendidas?
12. Qual nível de acessibilidade será exigido, por exemplo, WCAG 2.2 AA?
13. O produto será somente web responsivo ou também deverá ser instalável/nativo? Quais navegadores, sistemas operacionais e larguras mínimas serão suportados?
14. Favoritos, comparação, alertas, histórico ou múltiplas cidades devem ser considerados em uma fase posterior?
15. Qual métrica de resultado para usuários ou negócio indicará sucesso do produto?
