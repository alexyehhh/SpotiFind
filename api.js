// Import required modules
const express = require('express');
const request = require('request');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { promisify } = require('util');
const requestPostPromise = promisify(request.post);
const requestGetPromise = promisify(request.get);

// Create an instance of the Express application
const app = express();
app.use(cors());
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// Spotify API credentials
const client_id = 'bdda1770a6dd4e01ba0bb6aaa5886b11';
const client_secret = 'a8d60c3b750c4c898b735f122f8f9112';
const redirect_uri = 'http://localhost:3000/callback';

// Serve static files
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '.')));

// Endpoint for initiating the login flow
app.get('/login', (req, res) => {
  const scopes = 'playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + client_id +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

// Callback endpoint for handling the authorization code flow
app.get('/callback', (req, res) => {
  const code = req.query.code || null;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  // Exchange the authorization code for an access token and refresh token
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // Store the tokens and their expiry in the session
      req.session.access_token = body.access_token;
      req.session.refresh_token = body.refresh_token;
      req.session.token_expiry = Date.now() + body.expires_in * 1000;

      // Redirect to the success page
      res.redirect('/success');
    } else {
      // Redirect to the error page if there is an error
      res.redirect('/error');
    }
  });
});

// Function to refresh the access token if it has expired
function refreshIfExpired(req) {
  return new Promise((resolve, reject) => {
    if (!req.session.refresh_token) {
      console.error('Refresh token not available.');
      reject(new Error('Refresh token not available.'));
      return;
    }

    if (Date.now() > req.session.token_expiry) {
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: req.session.refresh_token
        },
        json: true
      };

      // Refresh the access token using the refresh token
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          // Update the access token and its expiry in the session
          req.session.access_token = body.access_token;
          req.session.token_expiry = Date.now() + body.expires_in * 1000;
          resolve(req.session.access_token);
        } else {
          console.error('Error refreshing access token. Error:', error, 'Response:', response && response.statusCode, 'Body:', body);
          reject(error);
        }
      });
    } else {
      // If the access token is still valid, resolve with it
      resolve(req.session.access_token);
    }
  });
}

// Redirect endpoint for successful authentication
app.get('/success', (req, res) => {
  res.redirect('http://localhost:3000/?authenticated=true');
});

// Endpoint for authentication error
app.get('/error', (req, res) => {
  res.send('Authentication failed. Please try again.');
});

// Endpoint for exporting a playlist
app.post('/export-playlist', (req, res) => {
  // Refresh the access token if it has expired
  refreshIfExpired(req).then(access_token => {
    const options = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    };
    requestGetPromise(options)
      .then(response => {
        const userId = response.body.id;
        const playlistName = req.body.playlistName || 'Mood generated playlist';
        const playlistOptions = {
          url: `https://api.spotify.com/v1/users/${userId}/playlists`,
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: playlistName,
            description: 'Created by SpotiFind',
            public: false 
          })
        };
        return requestPostPromise(playlistOptions);
      })
      .then(response => {
        // Return the response body
        res.json(response.body);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Failed to create a playlist.' });
      });
  });
});

// Endpoint for generating a happy playlist
app.get('/generate-happy-playlist', (req, res) => {
  // Refresh the access token if it has expired
  refreshIfExpired(req).then(access_token => {
    const targetValence = 0.8;
    const targetDanceability = 0.8;
    const targetEnergy = 0.8;

    const recommendationOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=pop&target_valence=${targetValence}&target_danceability=${targetDanceability}&target_energy=${targetEnergy}`,
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    };

    res.setHeader('Cache-Control', 'no-store');

    // Get track recommendations based on specified criteria
    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
        // Extract relevant track details and send a unique subset of tracks to the client
        const trackDetails = body.tracks.map(track => {
          return {
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name,
            albumCover: track.album.images[0].url
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);
        const uniqueDetails = shuffledDetails.slice(0, 20);
        res.json(uniqueDetails);
      } else {
        console.error('Error generating playlist:', body.error.message);
        res.status(response.statusCode).json({ error: body.error.message });
      }
    });
  }).catch(error => {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ error: 'Error refreshing access token.' });
  });
});

// Function to shuffle an array in-place
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Endpoint for generating an excited playlist
app.get('/generate-excited-playlist', (req, res) => {
  // Refresh the access token if it has expired
  refreshIfExpired(req).then(access_token => {
    const targetEnergy = 0.9;  // High energy
    const targetDanceability = 0.9;  // High danceability
    const targetTempo = 150;  // High tempo

    const recommendationOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=pop&target_energy=${targetEnergy}&target_danceability=${targetDanceability}&target_tempo=${targetTempo}`,
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    };

    res.setHeader('Cache-Control', 'no-store');

    // Get track recommendations based on specified criteria
    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
        // Extract relevant track details and send a unique subset of tracks to the client
        const trackDetails = body.tracks.map(track => {
          return {
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name,
            albumCover: track.album.images[0].url
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);
        const uniqueDetails = shuffledDetails.slice(0, 20);
        res.json(uniqueDetails);
      } else {
        console.error('Error generating playlist:', body.error.message);
        res.status(response.statusCode).json({ error: body.error.message });
      }
    });
  }).catch(error => {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ error: 'Error refreshing access token.' });
  });
});

// Endpoint for generating a sad playlist
app.get('/generate-sad-playlist', (req, res) => {
  // Refresh the access token if it has expired
  refreshIfExpired(req).then(access_token => {
    const targetValence = 0.2; // decrease valence for a sad mood
    const targetDanceability = 0.2; // decrease danceability for a sad mood
    const targetEnergy = 0.2; // decrease energy for a sad mood

    const recommendationOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=pop&target_valence=${targetValence}&target_danceability=${targetDanceability}&target_energy=${targetEnergy}`,
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    };

    res.setHeader('Cache-Control', 'no-store'); // disable caching

    // Get track recommendations based on specified criteria
    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
        // Extract relevant track details and send a unique subset of tracks to the client
        const trackDetails = body.tracks.map(track => {
          return {
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name,
            albumCover: track.album.images[0].url
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);
        const uniqueDetails = shuffledDetails.slice(0, 20);
        res.json(uniqueDetails);
      } else {
        console.error('Error generating playlist:', body.error.message);
        res.status(response.statusCode).json({ error: body.error.message });
      }
    });
  }).catch(error => {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ error: 'Error refreshing access token.' });
  });
});

// Endpoint for generating a chill playlist
app.get('/generate-chill-playlist', (req, res) => {
  // Refresh the access token if it has expired
  refreshIfExpired(req).then(access_token => {
    const targetValence = 0.6;
    const targetEnergy = 0.4;
    const recommendationOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=ambient&target_valence=${targetValence}&target_energy=${targetEnergy}`,
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    };

    res.setHeader('Cache-Control', 'no-store'); // disable caching

    // Get track recommendations based on specified criteria
    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
        // Extract relevant track details and send a unique subset of tracks to the client
        const trackDetails = body.tracks.map(track => {
          return {
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name,
            albumCover: track.album.images[0].url
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);
        const uniqueDetails = shuffledDetails.slice(0, 20);
        res.json(uniqueDetails);
      } else {
        console.error('Error generating playlist:', body.error.message);
        res.status(response.statusCode).json({ error: body.error.message });
      }
    });
  }).catch(error => {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ error: 'Error refreshing access token.' });
  });
});
