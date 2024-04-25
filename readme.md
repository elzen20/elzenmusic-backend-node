# Elzenmusic-backend-node

This is the Backend project that handles the Cart of Elzen Music Website. Once the stripe transaction it is succeded it sends to the client email a ZIP with the requested PDFs compressed.  


## Installation

1. Clone this Repository
2. Install dependencies with:

### `npm install`

3. Run the project:

### `npm start`

For security purpose we did not add the `.env` files so make sure to add it in order to test it:

- STATIC_DIR=<STATIC_DIR>
- STRIPE_PUBLISHABLE_KEY=<STRIPE_PUBLISHABLE_KEY>
- STRIPE_SECRET_KEY=<STRIPE_SECRET_KEY>
- CLIENT_EMAIL=<CLIENT_EMAIL>
- CLIENT_ID=<CLIENT_ID>
- CLIENT_SECRET=<CLIENT_SECRET>
- REDIRECT_URI=<REDIRECT_URI>
- REFRESH_TOKEN=<REFRESH_TOKEN>
- BUCKET_NAME=<BUCKET_NAME>
- PORT=<PORT>

Cloud infrastructure:
- Google Gmail API
- Google Storage
- Stripe
