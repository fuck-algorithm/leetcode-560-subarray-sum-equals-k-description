module.exports = {
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:56146', browserName: 'chromium', viewport: { width: 1366, height: 768 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:56146', reuseExistingServer: !process.env.CI, timeout: 120000 },
};
