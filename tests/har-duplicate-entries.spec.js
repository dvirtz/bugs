const {test, expect} = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const harPath = path.resolve('tests/fixtures/flaky-page.har');

test.describe('HAR Duplicate Entries Bug', () => {
  test('recording HAR with transient connection failure', async ({page}) => {
    const isReplayMode = process.env.REPLAY_MODE === 'true';
    console.log(`\n[Test] Running in ${isReplayMode ? 'REPLAY' : 'RECORDING'} mode`);

    // Configure HAR recording/playback
    await page.routeFromHAR(harPath, {
      update: !isReplayMode,
      notFound: isReplayMode ? 'abort' : 'fallback',
    });

    if (isReplayMode) {
      console.log('[Test] REPLAY mode: loading known-bad HAR with duplicate entries');

      const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
      const flakyPageEntries = har.log.entries.filter(e => e.request.url.includes('flaky-page'));
      console.log(`[Test] HAR contains ${flakyPageEntries.length} /flaky-page entry(ies)`);

      expect(flakyPageEntries.length).toBeGreaterThan(1);

      const first = flakyPageEntries[0].response.content || {};
      const firstHasBody = Boolean(first._file || first.text);
      expect(firstHasBody).toBe(false);

      await page.goto('/flaky-page', {waitUntil: 'domcontentloaded'});

      // This assertion is intentionally expected to fail when replay selects
      // the first (malformed/empty) matching entry from the HAR.
      await expect(page.locator('h1')).toContainText('Success');
    } else {
      // Navigate to endpoint that will trigger connection failure + automatic retry
      console.log('[Test] Navigating to /flaky-page (may fail first, then retry)...');
      try {
        await page.goto('/flaky-page', {waitUntil: 'domcontentloaded'});
      } catch (e) {
        console.log('[Test] Initial navigation failed (expected on first attempt), Playwright will retry');
      }

      // If we got here after recording, HAR should be created
      if (fs.existsSync(harPath)) {
        const harContent = fs.readFileSync(harPath, 'utf8');
        const har = JSON.parse(harContent);
        const flakyPageEntries = har.log.entries.filter(e => e.request.url.includes('flaky-page'));
        
        console.log(`[Test] HAR recorded with ${flakyPageEntries.length} entry(ies) for /flaky-page:`);
        flakyPageEntries.forEach((entry, idx) => {
          const status = entry.response.status;
          const hasContent = entry.response.content._file || entry.response.content.text;
          console.log(`       ${idx + 1}. Status ${status}, Has content: ${!!hasContent}`);
        });
        
        if (flakyPageEntries.length > 1) {
          console.log('[Test] ✅ BUG REPRODUCED: Multiple entries found for same URL!');
          console.log('[Test]    This demonstrates the duplicate entry issue.');
        } else {
          console.log('[Test] ℹ️  Single entry recorded (may indicate clean network or cached response)');
        }
      }
    }
  });
});
