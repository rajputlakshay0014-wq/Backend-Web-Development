'use strict';

// ─── YOUR FILE — implement this ───────────────────────────────────────────────
// Export handleWebhook(req, res), used by POST /webhooks in app.js.
// Also export _processedIds (your Set or Map) for test inspection/reset.
//
// Steps (in order):
//  1. Verify HMAC-SHA256 signature
//     - Signature header: req.headers['x-webhook-signature'] → 'sha256=<hex>'
//     - Compute: crypto.createHmac('sha256', WEBHOOK_SECRET).update(req.body).digest('hex')
//     - Compare: crypto.timingSafeEqual(Buffer.from(expected,'hex'), Buffer.from(received,'hex'))
//     - Mismatch or missing → res.status(401).json({ error: 'Invalid signature' })
//
//  2. Parse body: const event = JSON.parse(req.body)
//
//  3. Idempotency: if _processedIds.has(event.id) → res.status(200).json({ status: 'already_processed' })
//
//  4. Mark: _processedIds.add(event.id)
//
//  5. Acknowledge: res.status(200).json({ status: 'received' })
//     Then call handleEvent(event) inside setImmediate(() => { ... })



'use strict';

require('dotenv').config();

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {

  // 1. Verify HMAC-SHA256 signature
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET || 'testsecret';

  if (!signature || !secret || !signature.startsWith('sha256=')) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  const received = signature.slice(7);

  if (!/^[0-9a-f]{64}$/i.test(received)) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(req.body || '');

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(received, 'hex')
  );

  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  // 2. Parse request body
  let event;

  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid JSON'
    });
  }

  // 3. Check idempotency
  if (_processedIds.has(event.id)) {
    return res.status(200).json({
      status: 'already_processed'
    });
  }

  // 4. Mark event as processed
  _processedIds.add(event.id);

  // 5. Acknowledge immediately
  res.status(200).json({
    status: 'received'
  });

  // Process event after response
  setImmediate(async () => {
    try {
      await handleEvent(event);
    } catch (error) {
      console.error('Event processing failed:', error);
    }
  });
}

module.exports = { handleWebhook, _processedIds };
