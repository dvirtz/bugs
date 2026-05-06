import express from 'express';

const app = express();
const PORT = 3000;

// Track request counts to simulate transient failures
const requestCounts = {};
let serverRestarts = 0;

/**
 * This endpoint simulates a transient connection failure:
 * - First connection: abruptly closes (connection reset)
 * - Automatic retry by Playwright
 * - Second connection: returns 200 with HTML content
 * 
 * This reproduces the real-world scenario where network issues
 * cause both the failed and successful attempts to be recorded in the HAR.
 */
app.get('/flaky-page', (req, res) => {
  const clientId = req.ip || 'unknown';
  if (!requestCounts[clientId]) {
    requestCounts[clientId] = 0;
  }
  requestCounts[clientId]++;

  const attemptNumber = requestCounts[clientId];

  if (attemptNumber === 1) {
    // First attempt: simulate connection reset/network error
    console.log(
      `[flaky-page] Attempt ${attemptNumber} from ${clientId}: Simulating connection reset`
    );
    // Abruptly close the connection without sending response
    res.socket.destroy();
  } else {
    // Subsequent attempts: return successful response with HTML
    console.log(`[flaky-page] Attempt ${attemptNumber} from ${clientId}: Returning 200 OK with HTML`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Flaky Page</title>
        </head>
        <body>
          <h1>Success! This page was served after a transient connection failure.</h1>
          <p>Attempt number: ${attemptNumber}</p>
          <div id="content">This content should be visible after successful retry.</div>
        </body>
      </html>
    `);
  }
});

/**
 * Health check endpoint for Playwright to verify server is ready
 */
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Test server listening on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET /flaky-page     - Simulates connection reset then success');
  console.log('  GET /health         - Health check');
});
