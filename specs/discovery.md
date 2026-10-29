# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação para consultar informações meteorológicas por cidade. A experiência deve permitir encontrar uma cidade, consultar as condições atuais e verificar a previsão para os próximos cinco dias. Também deve oferecer alternância entre Celsius e Fahrenheit e funcionar em dispositivos móveis.

As decisões iniciais definem a fonte de dados, o período da previsão, a unidade padrão, a ausência de autenticação e persistência no servidor e o idioma da interface. Detalhes da busca, conteúdo das previsões e metas de disponibilidade e desempenho ainda precisam ser esclarecidos.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão de hoje e dos quatro dias seguintes.
- **RF-04 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit nas temperaturas exibidas.

- **RF-05 — Comunicar estados da consulta:** informar quando a busca estiver carregando, não retornar resultados, falhar ou apresentar dados indisponíveis ou desatualizados.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** adaptar os fluxos principais a diferentes tamanhos de tela, incluindo dispositivos móveis; larguras mínimas e critérios de validação ainda precisam ser definidos.
- **RNF-02 — Usabilidade:** permitir que os fluxos de busca, consulta e troca de unidade sejam compreensíveis; critérios observáveis de sucesso ainda precisam ser definidos.
- **RNF-03 — Acessibilidade:** oferecer operação por teclado e compatibilidade com tecnologias assistivas; nível de conformidade ainda precisa ser definido.
- **RNF-04 — Desempenho:** apresentar resultados dentro de uma meta de tempo a ser definida, considerando separadamente o tempo da aplicação e o da API externa.
- **RNF-05 — Atualidade dos dados:** definir uma idade máxima aceitável para os dados meteorológicos; quando excedida, aplicar o comportamento descrito em RF-05.
- **RNF-06 — Disponibilidade:** definir uma meta de disponibilidade e como contabilizar falhas da aplicação e da API externa.
- **RNF-07 — Compatibilidade:** definir navegadores, sistemas operacionais e versões suportados.

## Riscos

- **Dependência de serviço externo:** indisponibilidade, lentidão, limites de uso ou condições de atribuição da Open-Meteo podem impedir consultas ou exigir ajustes na integração.
- **Ambiguidade na busca:** cidades com nomes iguais podem levar à seleção de uma localização incorreta.
- **Granularidade e calendário da previsão:** o período está definido como hoje mais quatro dias, mas ainda falta decidir entre previsão diária ou horária e como aplicar o fuso horário local.
- **Dados desatualizados ou incompletos:** cobertura, frequência de atualização e campos disponíveis podem variar; não há ainda um limite definido para considerar os dados desatualizados.
- **Experiência móvel e compatibilidade:** sem dimensões, navegadores e critérios de validação definidos, os fluxos podem não funcionar adequadamente em alguns dispositivos.
- **Escopo de localização indefinido:** não está claro se a aplicação deve considerar cidades de qualquer país ou apenas uma região.
- **Arquitetura de integração indefinida:** a ausência de persistência no servidor não determina se o navegador chamará a Open-Meteo diretamente ou se haverá uma camada de servidor; essa decisão afeta cache, tratamento de falhas e limites de requisição.

## Perguntas em Aberto

1. Qual será o escopo geográfico da busca e quais entradas serão aceitas: cidade, país, estado ou código postal?
2. Como distinguir cidades com o mesmo nome nos resultados?
3. Quais informações compõem o clima atual e como indicar sua hora de observação ou atualização?
4. Quais campos serão exibidos na previsão, e ela será diária ou horária? Qual fuso horário define cada dia?
5. Quais endpoints e campos da Open-Meteo serão necessários? Quais limites de uso, condições de licença e atribuição se aplicam?
6. O navegador chamará a Open-Meteo diretamente ou haverá uma camada de servidor sem persistência? Haverá cache e, em caso afirmativo, por quanto tempo?
7. A unidade escolhida deve persistir entre visitas ou sessões? Se sim, pode ser armazenada localmente no dispositivo?
8. A aplicação oferecerá localização automática por GPS? Como solicitar consentimento e manter a busca manual disponível?
9. Como tratar falhas da API, ausência de conexão e dados desatualizados? Haverá nova tentativa ou exibição de dados em cache?
10. Quais metas mensuráveis de desempenho, disponibilidade, responsividade e acessibilidade devem ser atendidas?
11. O produto será um web app responsivo ou também deverá ser instalável/nativo? Quais navegadores, sistemas operacionais e larguras mínimas serão suportados?
12. Quais critérios de acessibilidade devem ser atendidos, por exemplo, qual nível WCAG?
13. É necessário oferecer várias cidades, cidades favoritas, comparação, alertas ou histórico? O que fica explicitamente fora do escopo inicial?
14. Qual resultado do ponto de vista do usuário ou do negócio indicará que o produto teve sucesso?

## Decisões

| Decisão | Justificativa | O que resolve |
|---|---|---|
| Usar a Open-Meteo como fonte de dados, sem API key. | Evita exigir uma chave de API para a integração inicial. | Define a fonte de dados (pergunta anterior sobre qual API). Limites de uso e condições de licença ou atribuição ainda precisam ser verificados. |
| Definir “5 dias” como hoje mais os quatro dias seguintes. | Estabelece um período de previsão inequívoco, incluindo o dia atual. | Resolve se o dia atual faz parte dos cinco dias. A granularidade diária ou horária continua em aberto. |
| Usar Celsius como unidade padrão. | Define o valor inicial apresentado ao usuário, mantendo a alternância prevista para Fahrenheit. | Resolve qual unidade deve aparecer por padrão. A persistência da preferência continua em aberto. |
| Não exigir autenticação nem persistir dados no servidor. | Mantém o escopo inicial sem contas de usuário ou armazenamento de dados associado a elas no servidor. | Define que o produto não terá login nem persistência server-side. Não determina se preferências serão salvas localmente no dispositivo. |
| Disponibilizar a interface em pt-BR. | Alinha idioma e convenções regionais da interface ao público inicial. | Define o idioma da interface para o escopo inicial; suporte a outros idiomas não faz parte desta decisão. |

## Suposições

- As hipóteses abaixo são provisórias e devem ser validadas durante a especificação.
- A busca será iniciada pelo usuário, sem exigir localização automática.
- A aplicação exibirá dados de uma cidade selecionada por vez.
- Assume-se inicialmente uma aplicação acessada por navegador em desktop e dispositivos móveis; o formato web responsivo versus nativo ainda precisa ser confirmado.