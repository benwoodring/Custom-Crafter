// services/pollOrders.js
const config = require('../config');
const axios = require('axios');
const nodemailer = require('nodemailer');
const Design = require('../models/Design');
const ProcessedOrder = require('../models/ProcessedOrder');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: 587,
  secure: false,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Polls the Squarespace Orders API, processes new orders, and sends email notifications with design attachments.
 * Skips already processed orders and logs progress or errors.
 * @async
 * @returns {Promise<boolean>} True if successful, false if failed
 */
async function pollOrders() {
  try {
    logger.debug('Starting poll with API key:', {
      keyPreview: config.squarespaceApi.apiKey.slice(0, 8) + '...',
    });
    const now = Date.now();
    const response = await axios.get(config.squarespaceApi.url, {
      headers: {
        Authorization: `Bearer ${config.squarespaceApi.apiKey}`,
        'User-Agent': config.squarespaceApi.userAgent,
      },
      params: {
        modifiedAfter: new Date(now - 10 * 60 * 1000).toISOString(),
        modifiedBefore: new Date(now).toISOString(),
      },
    });

    const orders = response.data.result || [];
    logger.debug('API response:', { data: JSON.stringify(response.data) });
    logger.info(`Polled ${orders.length} orders at ${new Date().toISOString()}`);

    for (const order of orders) {
      const orderId = order.id;
      if (await ProcessedOrder.exists({ orderId })) {
        logger.info(`Skipping processed order ${order.orderNumber} (ID: ${orderId})`);
        continue;
      }

      const designId = order.lineItems[0].customizations?.find(
        (custom) => custom.label === 'Text'
      )?.value;
      if (!designId) {
        logger.warn(`No Text customization found for order ${order.orderNumber} (ID: ${orderId})`);
        await ProcessedOrder.create({ orderId });
        continue;
      }

      const design = await Design.findOne({ designId });
      if (!design) {
        logger.error(`Design not found for Text: ${designId} in order ${order.orderNumber}`);
        await ProcessedOrder.create({ orderId });
        continue;
      }

      const base64Data = design.design.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const mailOptions = {
        from: config.email.from,
        to: config.email.to,
        subject: `New Order Image Received - Order ID: ${order.orderNumber}`,
        html: `
          <p>Order ${order.orderNumber} completed.</p>
          <p>Customer Email: ${order.customerEmail}</p>
          <p>Items: ${order.lineItems.map((item) => `${item.sku} (Qty: ${item.quantity})`).join(', ')}</p>
          <p>Fulfillment Status: ${order.fulfillmentStatus}</p>
          <p>See attached design image.</p>
        `,
        attachments: [
          {
            filename: `design-${designId}.png`,
            content: imageBuffer,
            contentType: 'image/png',
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        logger.info(
          `Email sent for order ${order.orderNumber} with attached design from ${config.email.from}`
        );
        await ProcessedOrder.create({ orderId });
      } catch (emailError) {
        logger.error(`Email sending failed for order ${order.orderNumber}:`, {
          error: emailError.message,
        });
      }
    }
    return true; // Success
  } catch (error) {
    logger.error('Polling error:', {
      details: error.response ? error.response.data : error.message,
    });
    return false; // Failure
  }
}

/**
 * Starts the polling process with exponential backoff on failure.
 * Regular interval is used on success; delay increases on consecutive failures.
 */
function startPolling() {
  let consecutiveFailures = 0;
  const maxDelay = 30 * 60 * 1000;
  const baseDelay = 1 * 60 * 1000;

  async function runPoll() {
    const success = await pollOrders();
    if (success) {
      consecutiveFailures = 0;
      setTimeout(runPoll, config.pollingInterval);
    } else {
      consecutiveFailures++;
      const delay = Math.min(baseDelay * Math.pow(2, consecutiveFailures - 1), maxDelay);
      logger.warn(
        `Polling failed ${consecutiveFailures} times, retrying in ${delay / 1000} seconds`
      );
      setTimeout(runPoll, delay);
    }
  }

  runPoll();
}

module.exports = { startPolling };
