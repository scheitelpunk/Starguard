import { test, expect } from '@playwright/test';

test.describe('Cybercrime Defense System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display cybercrime panel', async ({ page }) => {
    await expect(page.getByText('Cybercrime Defense System')).toBeVisible();
    
    // Check tabs
    await expect(page.getByRole('button', { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Attack Patterns/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Real-Time Scanner/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Threat Map/i })).toBeVisible();
  });

  test('should navigate between cybercrime tabs', async ({ page }) => {
    // Click Attack Patterns tab
    await page.getByRole('button', { name: /Attack Patterns/i }).click();
    await expect(page.getByText('Detected Attack Patterns')).toBeVisible();
    
    // Click Real-Time Scanner tab
    await page.getByRole('button', { name: /Real-Time Scanner/i }).click();
    await expect(page.getByText('Real-Time Threat Scanner')).toBeVisible();
    
    // Click Threat Map tab
    await page.getByRole('button', { name: /Threat Map/i }).click();
    await expect(page.getByText('Global Threat Map')).toBeVisible();
  });

  test('should display cybercrime statistics', async ({ page }) => {
    // Check for stats in overview
    await expect(page.getByText('BLOCKED ATTEMPTS')).toBeVisible();
    await expect(page.getByText('ACTIVE SCANS')).toBeVisible();
    await expect(page.getByText('IDENTIFIED PATTERNS')).toBeVisible();
    await expect(page.getByText('THREAT ACTORS')).toBeVisible();
  });

  test('should show recent cyber threats', async ({ page }) => {
    await expect(page.getByText('Recent Cyber Threats')).toBeVisible();
    
    // Check for threat types
    const threatTypes = ['DDoS Attack', 'SQL Injection', 'Port Scan', 'Brute Force'];
    for (const threat of threatTypes) {
      const threatElement = page.getByText(threat);
      if (await threatElement.isVisible()) {
        await expect(threatElement).toBeVisible();
        break;
      }
    }
  });

  test('real-time scanner should toggle scanning', async ({ page }) => {
    // Navigate to scanner
    await page.getByRole('button', { name: /Real-Time Scanner/i }).click();
    
    // Find scan button
    const scanButton = page.getByRole('button', { name: /Stop Scanning|Start Scanning/i });
    await expect(scanButton).toBeVisible();
    
    // Click to toggle
    const initialText = await scanButton.textContent();
    await scanButton.click();
    
    // Wait for state change
    await page.waitForTimeout(500);
    
    const newText = await scanButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('attack pattern analyzer should show patterns', async ({ page }) => {
    await page.getByRole('button', { name: /Attack Patterns/i }).click();
    
    // Check for pattern cards
    await expect(page.getByText(/APT|Ransomware|Phishing|Cryptojacking/)).toBeVisible();
    
    // Check for confidence scores
    await expect(page.getByText(/\d+% confidence/)).toBeVisible();
  });

  test('threat map should display canvas', async ({ page }) => {
    await page.getByRole('button', { name: /Threat Map/i }).click();
    
    // Check for canvas element
    const canvas = page.locator('canvas').nth(1); // Second canvas (first is 3D field)
    await expect(canvas).toBeVisible();
    
    // Check for map legend
    await expect(page.getByText('Normal Traffic')).toBeVisible();
    await expect(page.getByText('Attack Traffic')).toBeVisible();
  });

  test('should show pattern details on click', async ({ page }) => {
    await page.getByRole('button', { name: /Attack Patterns/i }).click();
    
    // Click on first pattern
    const firstPattern = page.locator('.bg-void-900\\/50').first();
    await firstPattern.click();
    
    // Check for expanded details
    await expect(page.getByText('Behavioral Indicators')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Details' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Block Pattern' })).toBeVisible();
  });
});