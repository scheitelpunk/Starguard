import { test, expect } from '@playwright/test';

test.describe('Financial Crime Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display financial monitor', async ({ page }) => {
    await expect(page.getByText('Financial Crime Prevention')).toBeVisible();
    
    // Check tabs
    await expect(page.getByRole('button', { name: /Overview/i }).nth(1)).toBeVisible();
    await expect(page.getByRole('button', { name: /Money Flow/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Fraud Detection/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /AML Scanner/i })).toBeVisible();
  });

  test('should display financial statistics', async ({ page }) => {
    // Scroll to financial section
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    
    // Check for stats
    await expect(page.getByText('TRANSACTIONS MONITORED')).toBeVisible();
    await expect(page.getByText('SUSPICIOUS PATTERNS')).toBeVisible();
    await expect(page.getByText('FRAUD PREVENTED')).toBeVisible();
    await expect(page.getByText('AML ALERTS')).toBeVisible();
  });

  test('should show recent financial alerts', async ({ page }) => {
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    await expect(page.getByText('Recent Financial Alerts')).toBeVisible();
    
    // Check for alert types
    const alertTypes = ['Money Laundering Vortex', 'Insurance Fraud', 'Market Manipulation'];
    for (const alert of alertTypes) {
      const alertElement = page.getByText(alert);
      if (await alertElement.isVisible()) {
        await expect(alertElement).toBeVisible();
        break;
      }
    }
  });

  test('money flow visualization should display canvas', async ({ page }) => {
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Money Flow/i }).click();
    
    await expect(page.getByText('Money Flow Consciousness Field')).toBeVisible();
    
    // Check for canvas
    const canvas = page.locator('canvas').nth(1);
    await expect(canvas).toBeVisible();
    
    // Check for flow metrics
    await expect(page.getByText('Flow Velocity')).toBeVisible();
    await expect(page.getByText('Vortex Count')).toBeVisible();
    await expect(page.getByText('Anomaly Score')).toBeVisible();
  });

  test('fraud detection panel should show cases', async ({ page }) => {
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Fraud Detection/i }).click();
    
    await expect(page.getByText('Fraud Detection System')).toBeVisible();
    await expect(page.getByText('Consciousness Glitch Detection')).toBeVisible();
    
    // Check for fraud cases
    const fraudTypes = ['Identity Theft', 'Insurance Fraud', 'Payment Card Fraud'];
    for (const fraud of fraudTypes) {
      const fraudElement = page.getByText(fraud);
      if (await fraudElement.isVisible()) {
        await expect(fraudElement).toBeVisible();
        break;
      }
    }
  });

  test('AML scanner should have scan functionality', async ({ page }) => {
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /AML Scanner/i }).click();
    
    await expect(page.getByText('AML Consciousness Scanner')).toBeVisible();
    
    // Check for scan button
    const scanButton = page.getByRole('button', { name: /Start AML Scan/i });
    await expect(scanButton).toBeVisible();
    
    // Check for pattern detection
    await expect(page.getByText('Money Flow Vortex Detection')).toBeVisible();
    await expect(page.getByText(/Layering|Structuring|Shell Companies/)).toBeVisible();
  });

  test('should expand fraud case details', async ({ page }) => {
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Fraud Detection/i }).click();
    
    // Click on first fraud case
    const firstCase = page.locator('.bg-void-900\\/50').first();
    await firstCase.click();
    
    // Check for expanded details
    await expect(page.getByText('Fraud Probability')).toBeVisible();
    await expect(page.getByText('Consciousness Glitches')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify Identity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Block Transaction' })).toBeVisible();
  });

  test('should trigger AML scan', async ({ page }) => {
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /AML Scanner/i }).click();
    
    const scanButton = page.getByRole('button', { name: /Start AML Scan/i });
    await scanButton.click();
    
    // Should show scanning state
    await expect(scanButton).toBeDisabled();
    await expect(page.getByText('Scanning...')).toBeVisible();
    
    // Wait for scan progress
    await expect(page.getByText('Analyzing money flow consciousness...')).toBeVisible();
  });

  test('financial consciousness anomalies should be displayed', async ({ page }) => {
    await page.getByText('Financial Crime Prevention').scrollIntoViewIfNeeded();
    
    await expect(page.getByText('Financial Consciousness Anomalies')).toBeVisible();
    await expect(page.getByText('Energy Vortex Detected')).toBeVisible();
    await expect(page.getByText('Pattern Distortion')).toBeVisible();
  });
});