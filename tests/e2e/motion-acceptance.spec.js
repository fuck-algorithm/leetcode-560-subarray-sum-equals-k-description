const { test, expect } = require('@playwright/test');

test.use({ video: 'off' });
test.setTimeout(30000);

test('motion: hash lookup uses a curved path and playback advances semantic frames', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: /Hash map|哈希表/i }).click();
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
  await expect(page.locator('.canvas-operation .operation-badge')).toContainText(/lookup|查询/i);
  const arrayNode = page.locator('[data-node-id="array-0"]');
  const hashNode = page.locator('[data-node-id="hash--2"]');
  const [arrayBox, hashBox] = await Promise.all([arrayNode.boundingBox(), hashNode.boundingBox()]);
  expect(hashBox.y - (arrayBox.y + arrayBox.height)).toBeGreaterThan(0);
  const arrowNode = page.locator('.flow-arrow').first();
  await expect(arrowNode).toHaveAttribute('data-route', 'rounded-elbow');
  const arrowPath = await arrowNode.getAttribute('d');
  expect(arrowPath).toContain('C');
  expect(arrowPath).toContain('L');
  await page.waitForTimeout(100);
  await page.screenshot({ path: testInfo.outputPath('lookup-curve.png') });
  await page.locator('.layer-legend').waitFor({ state: 'visible' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: testInfo.outputPath('lookup-curve-1920x1080.png') });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.setDefaultTimeout(5000);
  await page.getByRole('button', { name: /Speed|速度/ }).click();
  await page.getByRole('option', { name: '3×' }).click();
  await page.getByRole('button', { name: /Reset|重置/i }).click();
  const counter = page.locator('.step-counter');
  await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
  await expect(counter).toContainText('2 /');
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath('playback-3x.png') });
});

test('motion: reduced motion keeps narration, focus and code binding without transitions', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: /Hash map|哈希表/i }).click();
  const narration = page.locator('.step-narration');
  const initialNarration = await narration.textContent();
  await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
  await expect(narration).not.toHaveText(initialNarration);
  await expect(page.locator('.code-line.active').first()).toBeVisible();
  expect(await page.locator('.canvas-node rect').first().evaluate((node) => getComputedStyle(node).transitionDuration)).toBe('0s');
  await page.screenshot({ path: testInfo.outputPath('reduced-motion.png') });
});

test('motion: resizing preserves the user camera after initial fit', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  const svg = page.locator('.algorithm-svg');
  const layer = page.locator('.zoom-layer');
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 38, box.y + box.height / 2 + 22);
  await page.mouse.up();
  const manualTransform = await layer.getAttribute('transform');
  await page.setViewportSize({ width: 1600, height: 900 });
  await expect.poll(() => layer.getAttribute('transform')).toBe(manualTransform);
});

test('motion: seeking ten times never duplicates SVG marks or loses focus', async ({ page }, testInfo) => {
  await page.goto('/');
  const solution = page.getByRole('button', { name: /Hash map|哈希表/i });
  await solution.waitFor({ state: 'visible' });
  if (await solution.getAttribute('class') !== 'selected') await solution.click();
  const slider = page.getByRole('slider', { name: /Step|步骤/ });
  for (let index = 0; index < 10; index++) {
    await slider.focus();
    await slider.press(index % 2 ? 'ArrowLeft' : 'ArrowRight');
  }
  await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath('rapid-seek-recovered.png') });
  expect(await page.locator('[data-status="current"]').count()).toBeLessThanOrEqual(1);
  expect(await page.locator('.canvas-node').count()).toBeLessThanOrEqual(8);
  expect(await page.locator('.focus-arrow').count()).toBeLessThanOrEqual(1);
});

test('motion: 1x and 3x playback preserve smooth semantic pacing', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Hash map|哈希表/i }).click();
  for (const speed of ['1×', '3×']) {
    const factor = Number(speed.slice(0, 1));
    await page.getByRole('button', { name: /Speed|速度/ }).click();
    await page.getByRole('option', { name: speed }).click();
    await page.getByRole('button', { name: /Reset|重置/i }).click();
    const counter = page.locator('.step-counter');
    await page.getByRole('button', { name: /Next →|下一步 →/ }).click();
    await expect(counter).toContainText('2 /');
    await page.waitForTimeout(900 / factor);
    await page.getByRole('button', { name: /Reset|重置/i }).click();
    await page.screenshot({ path: testInfo.outputPath(`playback-${factor}x.png`) });
  }
  await page.screenshot({ path: testInfo.outputPath('playback-1x-and-3x.png') });
});
