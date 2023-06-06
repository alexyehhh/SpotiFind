const express = require('express');// import the Express.js library
const request = require('request');// import the request library

const app = express();// create an instance of an Express application to make endpoints for server

// define constants for the client ID, client secret, and redirect URI
const client_id = 'bdda1770a6dd4e01ba0bb6aaa5886b11';
const client_secret = 'a8d60c3b750c4c898b735f122f8f9112';
const redirect_uri = 'http://localhost:3000/callback'; 

app.get('/login', (req, res) => {// define a route for the '/login' endpoint to redirect to the spotfiy authorization page
  const scopes = 'playlist-modify-public'; // define the permissions the app will request
  res.redirect('https://accounts.spotify.com/authorize' + // redirect the user to the Spotify authorization page
    '?response_type=code' + // specify that your app needs an authorization code
    '&client_id=' + client_id + // ppend your app client ID
    '&scope=' + encodeURIComponent(scopes) + // append the scopes
    '&redirect_uri=' + encodeURIComponent(redirect_uri)); // append the redirect URI
});

app.get('/callback', (req, res) => {//define a route for the callback endpoint. This will handle the redirection from Spotify after the user authorizes the app
  const code = req.query.code || null; // get the authorization code from the request parameters

  const authOptions = { // define the options for the request to exchange the authorization code for an access token
    url: 'https://accounts.spotify.com/api/token', // the token endpoint
    form: {
      code: code, // authorization code
      redirect_uri: redirect_uri, // redirect URI
      grant_type: 'authorization_code' // grant type
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) // client credentials
    },
    json: true // specify that the response should be JSON
  };

  request.post(authOptions, (error, response, body) => { // make the request to get the access token
    if (!error && response.statusCode === 200) { // if the request was successful
      const access_token = body.access_token; // get the access token from the response
      const refresh_token = body.refresh_token; // get the refresh token from the response
      // Store the the tokens
      res.redirect('/success'); // redirect to a success page
    } else { // if the request failed
      res.redirect('/error'); // redirect to an error page
    }
  });
});

// define a route for the success endpoint. This can be used to render a success page after a successful authentication.
app.get('/success', (req, res) => {
  res.redirect('https://alexyehhh.github.io/spotifind/?authenticated=true'); // Redirect to the main website with query parameter
});


app.get('/error', (req, res) => {// define a route for the error endpoint. Display error page
  res.send('Authentication failed. Please try again.');
});

app.listen(3000, () => {// start the server making it listen for requests on port 3000.
	console.log('Server is running on port 3000');
  });