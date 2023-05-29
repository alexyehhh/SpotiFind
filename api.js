// Import the Express.js library. Express is a web application framework for Node.js.
const express = require('express');

// Import the 'request' library. 'request' is a simple way to make HTTP calls. It supports HTTPS and follows redirects by default.
const request = require('request');

// Create an instance of an Express application. This will be used to set up the endpoints for our server.
const app = express();

// Define constants for the client ID, client secret, and redirect URI of your Spotify app.
const client_id = 'bdda1770a6dd4e01ba0bb6aaa5886b11'; 
const client_secret = 'a8d60c3b750c4c898b735f122f8f9112';
const redirect_uri = 'http://localhost:3000/callback'; 

// Define a route for the '/login' endpoint. This will redirect the user to the Spotify authorization page.
app.get('/login', (req, res) => {
  const scopes = 'playlist-modify-public'; // Define the scopes (permissions) the app will request
  res.redirect('https://accounts.spotify.com/authorize' + // Redirect the user to the Spotify authorization page
    '?response_type=code' + // Specify that your app needs an authorization code
    '&client_id=' + client_id + // Append your app's client ID
    '&scope=' + encodeURIComponent(scopes) + // Append the scopes
    '&redirect_uri=' + encodeURIComponent(redirect_uri)); // Append the redirect URI
});

// Define a route for the '/callback' endpoint. This will handle the redirection from Spotify after the user authorizes the app.
app.get('/callback', (req, res) => {
  const code = req.query.code || null; // Get the authorization code from the request parameters

  // Define the options for the request to exchange the authorization code for an access token.
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token', // The token endpoint
    form: {
      code: code, // The authorization code
      redirect_uri: redirect_uri, // The redirect URI
      grant_type: 'authorization_code' // The grant type
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) // The client credentials
    },
    json: true // Specify that the response should be JSON
  };

  // Make the request to get the access token
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) { // If the request was successful
      const access_token = body.access_token; // Get the access token from the response
      const refresh_token = body.refresh_token; // Get the refresh token from the response
      // The tokens can now be stored for later use
      res.redirect('/success'); // Redirect to a success page
    } else { // If the request failed
      res.redirect('/error'); // Redirect to an error page
    }
  });
});

// Define a route for the '/success' endpoint. This can be used to render a success page after a successful authentication.
app.get('/success', (req, res) => {
  res.send('Authentication successful! New buttons/UI elements can be displayed here.');
});

// Define a route for the '/error' endpoint. This can be used to render an error page after a failed authentication.
app.get('/error', (req, res) => {
  res.send('Authentication failed. Please try again.');
});

// Start the server, making it listen for requests on port 3000.
app.listen(3000, () => {
	console.log('Server is running on port 3000');
  });