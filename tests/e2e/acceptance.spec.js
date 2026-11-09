const { test, expect } = require('@playwright/test');

test('E2E-001: single-screen canvas-first layout at both required viewports', async ({ page }) => {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.canvas-card')).toBeVisible();
    await expect(page.locator('.operation-badge')).toBeVisible();
    await expect(page.locator('.step-narration')).toBeVisible();
    const sizes = await page.evaluate(() => ({
      h: innerHeight,
      scroll: document.documentElement.scrollHeight,
      chrome: [...document.querySelectorAll('.app-header,.input-bar,.input-entry,.control-bar')].reduce((sum, node) => sum + node.getBoundingClientRect().height, 0),
      card: document.querySelector('.canvas-card').getBoundingClientRect().height,
      svg: document.querySelector('.algorithm-svg').getBoundingClientRect().height,
      share: document.querySelector('.canvas-card').getBoundingClientRect().width / (document.querySelector('.canvas-card').getBoundingClientRect().width + document.querySelector('.code-panel').getBoundingClientRect().width),
    }));
    expect(sizes.scroll).toBeLessThanOrEqual(viewport.height);
    expect(sizes.chrome / sizes.h).toBeLessThanOrEqual(viewport.height === 768 ? 0.26 : 0.22);
    expect(sizes.card / sizes.h).toBeGreaterThanOrEqual(viewport.height === 768 ? 0.62 : 0.76);
    expect(sizes.svg / sizes.h).toBeGreaterThanOrEqual(viewport.height === 768 ? 0.50 : 0.66);
    expect(sizes.share).toBeGreaterThanOrEqual(0.68);
  }
});

test('E2E-002: problem, Hot 100, and repository links open the expected destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.header-left')).toHaveAttribute('href', 'https://fuck-algorithm.github.io/leetcode-hot-100/');
  await expect(page.locator('.problem-title-link')).toHaveAttribute('href', 'https://leetcode.com/problems/subarray-sum-equals-k/');
  await expect(page.locator('.github-link')).toHaveAttribute('href', /github\.com\/fuck-algorithm\/leetcode-560/);
  for (const locator of [page.locator('.header-left'), page.locator('.problem-title-link'), page.locator('.github-link')]) await expect(locator).toHaveAttribute('target', '_blank');
});

test('E2E-003: invalid input does not advance and valid input resets to the first frame', async ({ page }) => {
  await page.goto('/');
  const counter = page.locator('.step-counter');
  await page.locator('#nums-input').fill('999, nope; k=2');
  await page.locator('#nums-input').press('Enter');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(counter).toHaveText(/1 \/ \d+/);
  await page.locator('#nums-input').fill('1, 2; k=2');
  await page.locator('#nums-input').press('Enter');
  await expect(counter).toHaveText(/1 \/ \d+/);
});

test('E2E-004: sample and random input update the visible data and animation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Sample|样例/ }).click();
  await expect(page.locator('.input-bar')).toContainText(/1, 1, 1/);
  await expect(page.locator('.step-counter')).toContainText(/1 \/ \d+/);
  await page.getByRole('button', { name: /Random|随机/ }).click();
  await expect(page.locator('.input-bar')).toContainText(/Target K = 2|目标 K = 2/); await expect(page.locator('.canvas-node')).toHaveCount(6);
});

test('E2E-005: code language preference persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/代码语言|Code language/).selectOption('python');
  await page.reload();
  await expect(page.getByLabel(/代码语言|Code language/)).toHaveValue('python');
});

test('E2E-006: step snapshots synchronize narration, code anchors and one current focus', async ({ page }) => {
  await page.goto('/');
  const narration = page.locator('.step-narration');
  const before = await narration.textContent();
  await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
  await expect(narration).not.toHaveText(before);
  await expect(page.locator('[data-status="current"]')).toHaveCount(1);
  await expect(page.locator('.code-line.active').first()).toBeVisible();
  await expect(page.locator('.layer-legend .legend-item')).toHaveCount(5);
});

test('E2E-007: keyboard controls move, play, pause and reset the timeline', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.step-counter')).toHaveText(/2 \/ \d+/);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.step-counter')).toContainText(/1 \/ \d+/);
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /暂停|Pause/ })).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /播放|Play/ })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('r');
  await expect(page.locator('.step-counter')).toContainText(/1 \/ \d+/);
});

test('E2E-008: range input seeks to the last deterministic snapshot', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByRole('slider', { name: /Step|步骤/ });
  const maximum = Number(await slider.getAttribute('max'));
  await slider.fill(String(maximum));
  await expect(page.locator('.step-counter')).toContainText(`${maximum + 1} / ${maximum + 1}`);
  await expect(page.locator('.operation-badge')).toContainText(/done/i);
});

test('E2E-009: canvas drag pans and wheel input zooms the camera', async ({ page }) => {
  await page.goto('/');
  const svg = page.locator('.algorithm-svg');
  const layer = page.locator('.zoom-layer');
  const before = await layer.getAttribute('transform');
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 45, box.y + box.height / 2 + 25); await page.mouse.up();
  await expect.poll(() => layer.getAttribute('transform')).not.toBe(before);
  const dragged = await layer.getAttribute('transform');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.wheel(0, -240);
  await expect.poll(() => layer.getAttribute('transform')).not.toBe(dragged);
});

test('E2E-010: algorithm idea dialog opens and closes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /思路|Idea/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /关闭|Close/ }).click();
  await expect(dialog).toBeHidden();
});

test('E2E-011: switching solutions resets independent snapshots', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /hash map|哈希表/i }).click();
  await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
  await expect(page.locator('.step-counter')).toContainText(/2 \/ \d+/);
  await page.getByRole('button', { name: /Brute force|暴力枚举/i }).click();
  await expect(page.locator('.algorithm-tabs .selected')).toContainText(/Brute force|暴力枚举/i);
  await expect(page.locator('.step-counter')).toContainText(/1 \/ \d+/);
  await page.getByRole('button', { name: /hash map|哈希表/i }).click();
  await expect(page.locator('.step-counter')).toContainText(/1 \/ \d+/);
});

test('E2E-012: community QR appears on hover and preserves its aspect ratio', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /Community|社区/ });
  await expect(button).toBeVisible();
  await button.hover();
  await expect(page.locator('.community-card')).toBeVisible();
  await expect(button.locator('img')).toBeVisible();
  const image = page.locator('.community-card img');
  await expect(image).toHaveAttribute('src', '/assets/qrcode-community.png');
  const size = await image.evaluate((img) => ({ natural: img.naturalWidth / img.naturalHeight, rendered: img.getBoundingClientRect().width / img.getBoundingClientRect().height }));
  expect(Math.abs(size.natural - size.rendered)).toBeLessThan(0.02);
});

test('E2E-013: playback speed persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/速度|Speed/).selectOption('2');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('leetcode-560-ui-preferences') || '{}').speed)).toBe(2);
  await page.reload();
  await expect(page.locator('.star-count')).toBeVisible();
  await expect(page.getByLabel(/速度|Speed/)).toHaveValue('2');
});

test('E2E-014: stars cache success and back off after API failure', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.github.com/repos/fuck-algorithm/leetcode-560-subarray-sum-equals-k-description', async (route) => {
    requests++; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stargazers_count: 0 }) });
  });
  await page.goto('/'); await expect(page.locator('.star-count')).toContainText('0');
  await page.reload(); await expect(page.locator('.star-count')).toContainText('0');
  expect(requests).toBeLessThanOrEqual(1);
});

test('E2E-015: published interface contains no purple state token', async ({ page }) => {
  await page.goto('/');
  const purples = await page.locator('*').evaluateAll((nodes) => nodes.flatMap((node) => [getComputedStyle(node).color, getComputedStyle(node).backgroundColor, getComputedStyle(node).borderColor]).filter((color) => /purple|rgb\(1[0-9]{2},\s*[0-9]{1,2},\s*1[0-9]{2}\)/i.test(color)));
  expect(purples).toEqual([]);
});

test('E2E-016: first visit is English and complete UI can switch to Chinese', async ({ page }) => {
  await page.addInitScript(() => { localStorage.removeItem('leetcode-560-ui-preferences'); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'LeetCode 560: Subarray Sum Equals K' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Random' })).toBeVisible();
  await page.getByLabel('Language', { exact: true }).selectOption('zh-CN');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('leetcode-560-ui-preferences') || '{}').locale)).toBe('zh-CN');
  await expect(page.getByRole('heading', { name: 'LeetCode 560：和为 K 的子数组' })).toBeVisible();
  await expect(page.getByRole('button', { name: '随机' })).toBeVisible();
  await expect(page.locator('.step-narration')).toContainText(/prefix|前缀和/i);
});

test('E2E-017: locale change preserves current step and code selection', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
  await page.getByLabel('Language', { exact: true }).selectOption('zh-CN');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('leetcode-560-ui-preferences') || '{}').locale)).toBe('zh-CN');
  await expect(page.locator('.step-counter')).toHaveText(/2 \/ \d+/);
  await page.getByLabel(/代码语言|Code language/).selectOption('go');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('leetcode-560-code-language'))).toBe('go');
  await page.reload();
  await expect(page.getByLabel(/Language|界面语言/)).toHaveValue('zh-CN');
  await expect(page.getByLabel(/代码语言|Code language/)).toHaveValue('go');
  await expect(page.locator('.step-counter')).toContainText(/1 \/ \d+/);
});
