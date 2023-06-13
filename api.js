const express = require('express');
const request = require('request');
const path = require('path');
const cors = require('cors');
const { promisify } = require('util');
const requestPostPromise = promisify(request.post);
const requestGetPromise = promisify(request.get);

const app = express();
app.use(cors());
app.use(express.json()); // <-- You missed this line

let access_token;
let refresh_token = null;
let token_expiry = null;

const client_id = 'bdda1770a6dd4e01ba0bb6aaa5886b11';
const client_secret = 'a8d60c3b750c4c898b735f122f8f9112';
const redirect_uri = 'http://localhost:3000/callback';

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '.')));

app.get('/login', (req, res) => {
  const scopes = 'playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + client_id +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

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

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      refresh_token = body.refresh_token;
      token_expiry = Date.now() + body.expires_in * 1000;

      res.redirect('/success');
    } else {
      res.redirect('/error');
    }
  });
});

function refreshIfExpired() {
  return new Promise((resolve, reject) => {
    if (!refresh_token) {
      console.error('Refresh token not available.');
      reject(new Error('Refresh token not available.'));
      return;
    }

    if (Date.now() > token_expiry) {
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          access_token = body.access_token;
          token_expiry = Date.now() + body.expires_in * 1000;
          resolve(access_token);
        } else {
          console.error('Error refreshing access token. Error:', error, 'Response:', response && response.statusCode, 'Body:', body);
          reject(error);
        }
      });
    } else {
      resolve(access_token);
    }
  });
}

app.get('/success', (req, res) => {
  res.redirect('http://localhost:3000/?authenticated=true');
});

app.get('/error', (req, res) => {
  res.send('Authentication failed. Please try again.');
});


// Add this endpoint to your app
app.post('/export-playlist', (req, res) => {
  refreshIfExpired().then(access_token => {
    // First, get user_id
    const options = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    };
    requestGetPromise(options)
      .then(response => {
        // Then, create a playlist
        const userId = response.body.id;
        const playlistName = req.body.playlistName || 'Mood generated playlist'; // use a default name if no name is provided
        const playlistOptions = {
          url: `https://api.spotify.com/v1/users/${userId}/playlists`,
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: playlistName,
            description: 'Created by SpotiFind',
            public: false // make it a private playlist
          })
        };
        return requestPostPromise(playlistOptions);
      })
      .then(response => {
        res.json(response.body);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Failed to create a playlist.' });
      });
  });
});

app.get('/generate-happy-playlist', (req, res) => {
  refreshIfExpired().then(access_token => {
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

    res.setHeader('Cache-Control', 'no-store'); // Disable caching

    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
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

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

app.get('/tokens', (req, res) => {
  res.json({
    accessToken: access_token,
    refreshToken: refresh_token,
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.get('/generate-excited-playlist', (req, res) => {
  refreshIfExpired().then(access_token => {
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

    res.setHeader('Cache-Control', 'no-store'); // Disable caching

    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
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

app.get('/generate-sad-playlist', (req, res) => {
  refreshIfExpired().then(access_token => {
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

    res.setHeader('Cache-Control', 'no-store'); // Disable caching

    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
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


app.get('/generate-chill-playlist', (req, res) => {
  refreshIfExpired().then(access_token => {
    const targetValence = 0.6;
    const targetEnergy = 0.4;
    const recommendationOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=ambient&target_valence=${targetValence}&target_energy=${targetEnergy}`,
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    };

    res.setHeader('Cache-Control', 'no-store'); // Disable caching

    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {
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
