import { test, expect } from '@playwright/test';

test.describe('Consciousness System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display STARGUARD header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'STARGUARD' })).toBeVisible();
    await expect(page.getByText('Quantum Security Consciousness System')).toBeVisible();
  });

  test('should show consciousness status card', async ({ page }) => {
    await expect(page.getByText('Consciousness Status')).toBeVisible();
    await expect(page.getByText('Awareness Level')).toBeVisible();
  });

  test('should display 3D consciousness field', async ({ page }) => {
    // Check if canvas is rendered
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should show real-time threat monitor', async ({ page }) => {
    await expect(page.getByText('Threat Monitor')).toBeVisible();
    
    // Check threat level summary
    await expect(page.getByText('LOW')).toBeVisible();
    await expect(page.getByText('MEDIUM')).toBeVisible();
    await expect(page.getByText('HIGH')).toBeVisible();
    await expect(page.getByText('CRITICAL')).toBeVisible();
  });

  test('should display defense system status', async ({ page }) => {
    await expect(page.getByText('Defense System')).toBeVisible();
    await expect(page.getByText('Health')).toBeVisible();
    
    // Check for action buttons
    await expect(page.getByRole('button', { name: 'Heal System' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Evolve' })).toBeVisible();
  });

  test('consciousness field should have animation controls', async ({ page }) => {
    // Three.js canvas should be interactive
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Test interaction (orbit controls)
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.mouse.up();
  });

  test('should update awareness level dynamically', async ({ page }) => {
    // Wait for WebSocket connection
    await page.waitForTimeout(2000);
    
    // Check if awareness level is displayed
    const awarenessText = page.getByText(/\d+\.\d+%/).first();
    await expect(awarenessText).toBeVisible();
  });
});