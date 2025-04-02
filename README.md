# Factura

A Node.js application that polls Squarespace orders, processes custom designs, and sends email notifications with attached images.

## Overview

Factura is a backend service designed to integrate with Squarespace’s Commerce API. It periodically checks for new orders, extracts custom design data (stored as base64 PNGs), saves them to a MongoDB database, and emails the designs to a specified recipient. Built with Express.js, it includes robust error handling, input validation, and rate limiting for security and reliability.

Squarespace doesn't allow custom design information to be saved with orders. This backend service, in conjunction with a custom front end code block (see below) is designed to overcome that limitation and allow Squarespace stores to associate custom designs from customers with orders. 

You can see a demo of the front end here: https://chapelsoftware.net

If you would like to use this application on your own Squarespace site please reach out to me and we can discuss options (self-hosting, or I can host the backend for you for a monthly fee).

## Features

- **Squarespace Integration:** Polls the Squarespace Orders API every 5 minutes to fetch recent orders.
- **Design Management:** Saves custom designs (PNG Data URLs) to MongoDB via POST requests.
- **Email Notifications:** Sends emails with design attachments using Nodemailer and Zoho SMTP.
- **Security:** Includes rate limiting (`express-rate-limit`), input sanitization (`express-validator`), and CORS protection.
- **Error Handling:** Centralized error middleware ensures consistent JSON error responses.
- **Logging:** Uses Winston for structured logging with timestamps and levels (debug, info, warn, error).
- **Configuration:** Environment variables managed with `envalid` for validation and `dotenv` for loading.

## Prerequisites

- **Node.js:** v18.x or higher (tested with v20.x as of March 2025).
- **PNPM:** v10.6.2 (specified package manager).
- **MongoDB:** A running instance (local or cloud, e.g., MongoDB Atlas).
- **Squarespace API Key:** For order polling.
- **Zoho Mail Account:** For SMTP email sending.

## Installation

1. **Clone the Repository:**
   ```
   git clone https://github.com/yourusername/Factura.git
   cd Factura
   ```

2. **Install Dependencies:**
   ```
   pnpm install
   ```

3. **Set Up Environment Variables:**
   - Copy the example file:
     ```
     cp .env.example .env
     ```
   - Edit `.env` with your values:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/factura
     SQUARESPACE_API_KEY=your-squarespace-api-key
     EMAIL_USER=your-email@zoho.com
     EMAIL_PASS=your-email-password
     EMAIL_ALIAS="Your Name <your-email@zoho.com>"
     NOTIFICATION_EMAIL=recipient@example.com
     NODE_ENV=development
     ```

4. **Start the Server:**
   ```
   pnpm start
   ```
   - The server runs on `http://localhost:3000` (or your `PORT`).

## Usage

### API Endpoints
- **POST `/api/save-design`:**
  - Saves a design to MongoDB.
  - Body: `{ "design": "data:image/png;base64,...", "designId": "unique-id", "template": "template-name" }`
  - Response: `{ "designId": "unique-id" }` (200 OK) or error (400/500).
- **GET `/api/designs/:designId`:**
  - Retrieves a design by ID.
  - Response: Design object (200 OK) or error (404/500).

### Polling
- The app polls Squarespace every 5 minutes, processes orders with a `Text` customization (mapped to `designId`), retrieves the design from MongoDB, and emails it with the PNG attached.

## File Structure

Root directory: factura/
- .env.example: Template for environment variables
- config.js: Centralized app configuration
- middleware/errorHandler.js: Centralized error handling
- middleware/rateLimiter.js: Rate limiting for API
- middleware/validateDesign.js: Input validation/sanitization
- models/Design.js: Design model (Mongoose schema)
- models/ProcessedOrder.js: Processed order tracking (Mongoose schema)
- routes/design.js: Design endpoints
- services/pollOrders.js: Order polling and email sending
- utils/logger.js: Winston logging setup
- package.json: Dependencies and scripts
- server.js: Main Express server

## Scripts

- **`pnpm start`:** Runs the server (`node server.js`).

## Configuration

Edit `.env` to customize:
- `PORT`: Server port (default: 3000).
- `MONGODB_URI`: MongoDB connection string.
- `SQUARESPACE_API_KEY`: API key for Squarespace.
- `EMAIL_*`: Zoho SMTP credentials and recipients.
- `NODE_ENV`: `development` or `production` (affects logging verbosity).

## Security Notes

- **Rate Limiting:** 100 requests per IP every 15 minutes.
- **Input Validation:** Ensures `design`, `designId`, and `template` are valid strings.

## TODO:
- **Detach from Zoho specific email**
- **Allow writing to a file instead of using Mongo**
- **Use Squarespace's webhooks instead of polling for orders (requires special approval from Squarespace)**
- **Optimize Config/.env to avoid redundancies**
- **Multi-tenant support**
- **Themeing**
## Contact

For issues or questions, open an issue on GitHub or contact ben.woodring@protonmail.com
