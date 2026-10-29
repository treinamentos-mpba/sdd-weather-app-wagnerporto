import { expect, type Page, test } from '@playwright/test';

const geocodingFixture = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      admin1: 'São Paulo',
      country: 'Brasil',
      latitude: -23.55,
      longitude: -46.63,
      timezone: 'America/Sao_Paulo',
    },
  ],
};

// current.time é gerado no instante do teste (offset 0) para que os dados
// estejam sempre dentro da janela de atualidade, sem depender de relógio fixo.
function forecastFixture() {
  const now = new Date();
  const days = Array.from({ length: 5 }, (_, index) =>
    new Date(now.getTime() + index * 86_400_000).toISOString().slice(0, 10),
  );

  return {
    timezone: 'America/Sao_Paulo',
    utc_offset_seconds: 0,
    current: {
      time: now.toISOString().slice(0, 16),
      temperature_2m: 0,
      apparent_temperature: 1.2,
      relative_humidity_2m: 80,
      weather_code: 2,
      wind_speed_10m: 10,
    },
    daily: {
      time: days,
      weather_code: [0, 1, 2, 3, 61],
      temperature_2m_max: [20, 21, 22, 23, 24],
      temperature_2m_min: [10, 11, 12, 13, 14],
      precipitation_probability_max: [5, 10, 15, 20, 25],
    },
  };
}

async function mockWeatherRoutes(page: Page) {
  await page.route('**/v1/search**', (route) => route.fulfill({ json: geocodingFixture }));
  await page.route('**/v1/forecast**', (route) => route.fulfill({ json: forecastFixture() }));
}

async function searchFor(page: Page, cityName: string) {
  await page.getByLabel('Cidade').fill(cityName);
  await page.getByRole('button', { name: 'Buscar' }).click();
}

test.describe('fluxo principal', () => {
  test('busca cidade, exibe clima atual, previsão e converte para °F', async ({ page }) => {
    await mockWeatherRoutes(page);
    await page.goto('/');

    await searchFor(page, 'São Paulo');

    // Nome da cidade no título da seção de clima atual.
    await expect(page.getByRole('heading', { name: 'Clima em São Paulo' })).toBeVisible();

    // Região de previsão com 5 cartões de dias.
    const forecastRegion = page.getByRole('region', { name: 'Próximos dias' });
    await expect(forecastRegion).toBeVisible();
    await expect(forecastRegion.getByRole('article')).toHaveCount(5);

    // Conversão de unidade: 0 °C → 32 °F sem nova requisição.
    await expect(page.getByText('0 °C', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fahrenheit' }).click();
    await expect(page.getByText('32 °F', { exact: true })).toBeVisible();
    await expect(page.getByText('0 °C', { exact: true })).toBeHidden();
  });
});

test.describe('estado vazio', () => {
  test('geocoding sem results exibe "Nenhuma cidade encontrada"', async ({ page }) => {
    await page.route('**/v1/search**', (route) => route.fulfill({ json: {} }));
    await page.goto('/');

    await searchFor(page, 'Xyzzy');

    await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  });
});

test.describe('falha de API e retry', () => {
  test('forecast com HTTP 500 mostra erro e retry recupera', async ({ page }) => {
    let forecastCalls = 0;
    await page.route('**/v1/search**', (route) => route.fulfill({ json: geocodingFixture }));
    await page.route('**/v1/forecast**', (route) => {
      forecastCalls += 1;
      if (forecastCalls === 1) {
        return route.fulfill({ status: 500, json: {} });
      }
      return route.fulfill({ json: forecastFixture() });
    });
    await page.goto('/');

    await searchFor(page, 'São Paulo');

    await expect(page.getByRole('alert')).toContainText(
      'Não foi possível obter os dados meteorológicos.',
    );

    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    await expect(page.getByRole('heading', { name: 'Clima em São Paulo' })).toBeVisible();
  });

  test('rede offline mostra erro amigável com retry disponível', async ({ page }) => {
    // Simula queda de rede abortando a requisição antes de sair do browser.
    await page.route('**/v1/search**', (route) => route.abort('internetdisconnected'));
    await page.goto('/');

    await searchFor(page, 'São Paulo');

    await expect(page.getByRole('alert')).toContainText(
      'Não foi possível obter os dados meteorológicos.',
    );
    await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  });
});

test.describe('validação de busca', () => {
  test('busca vazia orienta a pessoa usuária sem chamar a API', async ({ page }) => {
    let searchCalled = false;
    await page.route('**/v1/search**', (route) => {
      searchCalled = true;
      return route.fulfill({ json: geocodingFixture });
    });
    await page.goto('/');

    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('alert')).toContainText('Informe o nome de uma cidade.');
    expect(searchCalled).toBe(false);
  });
});

test.describe('resposta parcial', () => {
  test('campos ausentes aparecem como Indisponível sem derrubar o restante', async ({ page }) => {
    const partial = forecastFixture();
    partial.current.temperature_2m = null as unknown as number;
    partial.daily.temperature_2m_min = [null, 11, 12, 13, 14] as unknown as number[];

    await page.route('**/v1/search**', (route) => route.fulfill({ json: geocodingFixture }));
    await page.route('**/v1/forecast**', (route) => route.fulfill({ json: partial }));
    await page.goto('/');

    await searchFor(page, 'São Paulo');

    const currentRegion = page.getByRole('region', { name: 'Clima em São Paulo' });
    await expect(currentRegion).toBeVisible();
    await expect(currentRegion.getByText('Indisponível').first()).toBeVisible();

    // A previsão válida permanece visível com os cinco dias.
    const forecastRegion = page.getByRole('region', { name: 'Próximos dias' });
    await expect(forecastRegion.getByRole('article')).toHaveCount(5);
    await expect(forecastRegion.getByText('Indisponível')).toHaveCount(1);
  });
});

test.describe('viewport mobile (375x812)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('fluxo principal renderiza o clima corretamente', async ({ page }) => {
    await mockWeatherRoutes(page);
    await page.goto('/');

    await searchFor(page, 'São Paulo');

    await expect(page.getByRole('heading', { name: 'Clima em São Paulo' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeVisible();
    await expect(page.getByText('0 °C', { exact: true })).toBeVisible();

    // O toggle de unidade visível no mobile continua funcional.
    await page.getByRole('button', { name: 'Fahrenheit' }).click();
    await expect(page.getByText('32 °F', { exact: true })).toBeVisible();

    // Sem rolagem horizontal no viewport mobile.
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
