# Playwright HAR Duplicate Entries Bug - Reproduction

This directory contains a minimal reproduction of a bug in Playwright's HAR recording/replay mechanism.

## Issue Summary

When `page.routeFromHAR()` is used in **recording mode** (`update: true`) and a network request encounters a transient failure that gets retried:

1. **Both the failed request AND the successful retry are recorded** as separate entries in the HAR file
2. During **replay**, Playwright uses the **first matching entry** for a given URL
3. If the first entry is the failed response (e.g., connection reset, empty body), the page content will be malformed/empty
4. Tests fail because expected DOM elements aren't present

### Affected HAR Entries

Each malformed entry has:
- `response.status: 200` (HTTP success status) OR connection error markers
- `response.content.mimeType: "text/html; charset=utf-8"` (claims to be HTML)
- **No `response.content._file` or `response.content.text`** (empty body)
- `response.headers` includes `content-encoding: gzip` (claiming to be compressed but actually empty)

When Playwright replays, it matches the first entry and attempts to serve the empty response, resulting in:
- Blank page title
- No `#content` element
- Missing userscript injection targets
- Test failures

## How to Run the Reproduction

### Prerequisites

```bash
# Install dependencies (JavaScript only, no TypeScript needed)
npm install
```
The repo includes a test server (`server.mjs`) that will be started automatically during the record step.

### Step 1: Record the HAR (demonstrates the issue pattern)

```bash
npm run record
```

This will:
1. Start a test server on `http://localhost:3000`
2. Run the Playwright test in recording mode (`update: true`)
3. Hit the `/flaky-page` endpoint which:
   - First request: closes connection (connection reset error)
   - Playwright retries automatically
   - Second request: HTTP 200 with HTML content
4. Create `tests/fixtures/flaky-page.har` capturing the transaction

### Step 2: Inspect the HAR File

```bash
node -e "const fs=require('fs'); const h=JSON.parse(fs.readFileSync('tests/fixtures/flaky-page.har')); h.log.entries.forEach((e,i) => console.log(\`Entry \${i+1}: \${e.request.method} \${e.request.url} -> Status \${e.response.status}\`));"
```

Expected output shows the recorded transaction.

### Step 3: Replay the HAR

```bash
npm run replay
```

This replay is expected to fail. It demonstrates that Playwright uses the first matching HAR entry (the malformed empty response) instead of the later successful duplicate entry for the same URL.

This command works on Windows, Mac, and Linux thanks to `cross-env`.

Alternatively, if you want to run Playwright directly:
- **Linux/Mac**: `REPLAY_MODE=true npx playwright test --reporter=list`
- **Windows PowerShell**: `$env:REPLAY_MODE='true'; npx playwright test --reporter=list`
- **Windows CMD**: `set REPLAY_MODE=true && npx playwright test --reporter=list`

## Expected vs Actual

### Expected Behavior

- Playwright should **deduplicate by URL** during recording or replay
- Keep only the **final successful response** (HTTP 200 with content)
- Discard intermediate failure attempts (connection errors, empty responses)
- Resulting HAR has 1 entry per URL, not duplicate entries

### Actual Behavior

- Both the failed and successful requests are recorded
- On replay, the first entry (often the failed one) is used
- Page content is malformed/empty
- Tests fail with "element not found" errors

## Workaround

After recording HAR files with `UPDATE_HAR=1`:

```bash
# Remove empty HTML entries (no _file or text body)
# Example script to clean corrupted HARs:
node -e "
const fs = require('fs');
const files = require('glob').sync('tests/fixtures/har/**/*.har');
files.forEach(f => {
  const har = JSON.parse(fs.readFileSync(f));
  har.log.entries = har.log.entries.filter(e => 
    !(e.response.status === 200 && e.response.content.mimeType?.includes('text/html') && !e.response.content._file && !e.response.content.text)
  );
  fs.writeFileSync(f, JSON.stringify(har, null, 2), 'utf8');
});
"
```

Or manually delete the malformed entries from the HAR JSON before committing.

## Files in This Reproduction

- `server.mjs` - Test server that simulates transient connection failures
- `playwright.config.js` - Playwright configuration (JavaScript only)
- `tests/har-duplicate-entries.spec.js` - Test demonstrating the issue
- `tests/fixtures/flaky-page.har` - Generated HAR file (created on first run)
- `package.json` - Dependencies

