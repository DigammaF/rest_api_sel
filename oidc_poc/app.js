require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');

const app = express();

// 1. Secure Session Configuration
app.use(session({
  name: '__Host-auth-session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

let client;

// 2. OIDC Client Discovery & Setup
async function initializeOidc() {
  const issuer = await Issuer.discover(process.env.OIDC_ISSUER);
  client = new issuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [process.env.REDIRECT_URI],
    response_types: ['code']
  });
}

// 3. Login Route (Initiate PKCE)
app.get('/login', (req, res) => {
  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);

  req.session.code_verifier = code_verifier;

  const authUrl = client.authorizationUrl({
    scope: 'openid email profile',
    code_challenge,
    code_challenge_method: 'S256',
  });

  res.redirect(authUrl);
});

// 4. Callback Route (Exchange Code for Tokens)
app.get('/callback', async (req, res) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(process.env.REDIRECT_URI, params, {
      code_verifier: req.session.code_verifier,
    });

    // Store tokens in session, NOT in browser storage
    req.session.tokens = tokenSet;
    req.session.user = tokenSet.claims();

    res.redirect('/dashboard');
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    res.status(500).send('Authentication failed');
  }
});

// 5. Protected Route Example
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.status(401).send('Unauthorized');
  res.send(`Welcome, ${req.session.user.email}`);
});

initializeOidc().then(() => {
  app.listen(3000, () => console.log('BFF Server running on http://localhost:3000'));
});
