const express = require('express');  // require express library for server creation and routing
const request = require('request');  // require request library for making HTTP requests
const path = require('path');  // require path library to work with file and directory paths
const cors = require('cors');  // require cors library to enable CORS
const { promisify } = require('util');  // require util library to use promisify method
const requestPostPromise = promisify(request.post);  // promisify request.post to use it with promises
const requestGetPromise = promisify(request.get);  // promisify request.get to use it with promises

const app = express();  // initialize express app
app.use(cors());  // use cors middleware to enable CORS
app.use(express.json());  // use express.json middleware to parse JSON request bodies

let access_token;  // initialize variable to hold access token
let refresh_token = null;  // initialize variable to hold refresh token
let token_expiry = null;  // initialize variable to hold token expiry

const client_id = 'bdda1770a6dd4e01ba0bb6aaa5886b11';  // spotify application client id
const client_secret = 'a8d60c3b750c4c898b735f122f8f9112';  // spotify application client secret
const redirect_uri = 'http://localhost:3000/callback';  // redirect URI for Spotify API

app.use(express.static('public'));  // set public directory as static to serve static files
app.use(express.static(path.join(__dirname, '.')));  // set current directory as static to serve static files

// setup the login endpoint which redirects to Spotify login page
app.get('/login', (req, res) => {
  const scopes = 'playlist-modify-public';  // define the scope of the application
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + client_id +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

// setup the callback endpoint that Spotify will redirect to after login
app.get('/callback', (req, res) => {
  const code = req.query.code || null;  // extract the authorization code from the query parameters

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',  // spotify token API endpoint
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'  // specify the grant type for the request
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))  // add Authorization header
    },
    json: true  // set response data type as JSON
  };

  // make a post request to the Spotify token API to get the access and refresh tokens
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {  // if request is successful
      access_token = body.access_token;  // set the access token
      refresh_token = body.refresh_token;  // set the refresh token
      token_expiry = Date.now() + body.expires_in * 1000;  // Set the token expiry

      res.redirect('/success');  // redirect to success page
    } else {
      res.redirect('/error');  // redirect to error page
    }
  });
});

// function to refresh the access token if it has expired
function refreshIfExpired() {
  return new Promise((resolve, reject) => {
    if (!refresh_token) {  // if there is no refresh token
      console.error('Refresh token not available.');  // log an error message
      reject(new Error('Refresh token not available.'));  // reject the promise with an error
      return;
    }

    if (Date.now() > token_expiry) {  // if the token has expired
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',  // spotify token API endpoint
        headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },  // add Authorization header
        form: {
          grant_type: 'refresh_token',  // specify the grant type for the request
          refresh_token: refresh_token  // include the refresh token
        },
        json: true  // set response data type as JSON
      };

      // make a post request to the Spotify token API to refresh the access token
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {  // if request is successful
          access_token = body.access_token;  // update the access token
          token_expiry = Date.now() + body.expires_in * 1000;  // update the token expiry
          resolve(access_token);  // resolve the promise with the new access token
        } else {
          console.error('Error refreshing access token. Error:', error, 'Response:', response && response.statusCode, 'Body:', body);  // log the error
          reject(error);  // reject the promise with an error
        }
      });
    } else {
      resolve(access_token);  // if the token hasnt expired, resolve the promise with the current access token
    }
  });
}

// setup the success endpoint 
app.get('/success', (req, res) => {
  res.redirect('http://localhost:3000/?authenticated=true');
});

// Setup the error endpoint 
app.get('/error', (req, res) => {
  res.send('Authentication failed. Please try again.');
});

// setup the export-playlist endpoint which exports the user playlist
app.post('/export-playlist', (req, res) => {
  refreshIfExpired().then(access_token => {
    const options = {
      url: 'https://api.spotify.com/v1/me',  // spotify user profile API endpoint
      headers: {
        'Authorization': `Bearer ${access_token}`  // add Authorization header
      },
      json: true  // set response data type as JSON
    };
    requestGetPromise(options)
      .then(response => {
        const userId = response.body.id;  // get the user id from the response
        const playlistName = req.body.playlistName || 'Mood generated playlist';  // get the playlist name from the request or use a default name
        const playlistOptions = {
          url: `https://api.spotify.com/v1/users/${userId}/playlists`,  // spotify create playlist API endpoint
          headers: {
            'Authorization': `Bearer ${access_token}`,  // add Authorization header
            'Content-Type': 'application/json'  // set Content-Type header
          },
          body: JSON.stringify({
            name: playlistName,
            description: 'Created by SpotiFind',
            public: false 
          })
        };
        return requestPostPromise(playlistOptions);  // make a post request to create the playlist
      })
      .then(response => {
        res.json(response.body);  // send the response from Spotify as the response
      })
      .catch(err => {
        console.error(err);  // log the error
        res.status(500).json({ error: 'Failed to create a playlist.' });  // send a 500 status code and a message indicating the playlist creation failed
      });
  });
});

// setup the generate-happy-playlist endpoint which generates a happy mood playlist
app.get('/generate-happy-playlist', (req, res) => {
  refreshIfExpired().then(access_token => {
    const targetValence = 0.8;  // set the target valence (musical positiveness) for the recommendation
    const targetDanceability = 0.8;  // set the target danceability for the recommendation
    const targetEnergy = 0.8;  // set the target energy for the recommendation

    const recommendationOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=pop&target_valence=${targetValence}&target_danceability=${targetDanceability}&target_energy=${targetEnergy}`,  // spotify recommendation API endpoint
      headers: {
        'Authorization': `Bearer ${access_token}`  // add Authorization header
      },
      json: true  // set response data type as JSON
    };

    res.setHeader('Cache-Control', 'no-store');  // disable caching of the response

    request.get(recommendationOptions, (error, response, body) => {
      if (response.statusCode === 200) {  // if the request is successful
        const trackDetails = body.tracks.map(track => {  //map the response tracks to an array of track details
          return {
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name,
            albumCover: track.album.images[0].url
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);  //shuffle the track details
        const uniqueDetails = shuffledDetails.slice(0, 20);  //get the first 20 tracks
        res.json(uniqueDetails);  //send the track details as the response
      } else {
        console.error('Error generating playlist:', body.error.message);  // log the error message
        res.status(response.statusCode).json({ error: body.error.message });  // send the status code and error message as the response
      }
    });
  }).catch(error => {
    console.error('Error refreshing access token:', error);  //log the error
    res.status(500).json({ error: 'Error refreshing access token.' });  // send a 500 status code and a message indicating there was an error refreshing the access token
  });
});

// a utility function to shuffle an array
function shuffleArray(array) {
  const newArray = [...array];  // create a copy of the array
  for (let i = newArray.length - 1; i > 0; i--) {  // loop through the array in reverse order
    const j = Math.floor(Math.random() * (i + 1));  // generate a random index
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];  // swap the elements at the current index and the random index
  }
  return newArray;  // return the shuffled array
}

// setup the tokens endpoint which returns the access and refresh tokens
app.get('/tokens', (req, res) => {
  res.json({
    accessToken: access_token,
    refreshToken: refresh_token,
  });
});

// start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.get('/generate-excited-playlist', (req, res) => {  // endpoint to generate excited playlist
  refreshIfExpired().then(access_token => {  // refresh token if expired
    const targetEnergy = 0.9;  // high energy
    const targetDanceability = 0.9;  // high danceability
    const targetTempo = 150;  // high tempo

    const recommendationOptions = {  // spotify recommendation options
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=pop&target_energy=${targetEnergy}&target_danceability=${targetDanceability}&target_tempo=${targetTempo}`,  // aPI endpoint
      headers: {
        'Authorization': `Bearer ${access_token}`  // authorization token
      },
      json: true  // set the response data type as JSON
    };

    res.setHeader('Cache-Control', 'no-store');  // disable caching of the response

    request.get(recommendationOptions, (error, response, body) => {  // request to Spotify API
      if (response.statusCode === 200) {  // if the request is successful
        const trackDetails = body.tracks.map(track => {  // extract relevant track details
          return {
            uri: track.uri,  // track URI
            name: track.name,  // track name
            artist: track.artists[0].name,  // track artist
            albumCover: track.album.images[0].url  // track album cover
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);  // shuffle the track details
        const uniqueDetails = shuffledDetails.slice(0, 20);  // get the first 20 unique track details
        res.json(uniqueDetails);  // send the track details as the response
      } else {  // if the request fails
        console.error('Error generating playlist:', body.error.message);  // log the error message
        res.status(response.statusCode).json({ error: body.error.message });  // send the status code and error message as the response
      }
    });
  }).catch(error => {  // if theres an error refreshing the token
    console.error('Error refreshing access token:', error);  // log the error
    res.status(500).json({ error: 'Error refreshing access token.' });  // send a 500 status code and a message indicating there was an error refreshing the access token
  });
});

app.get('/generate-sad-playlist', (req, res) => {  // endpoint to generate sad playlist
  refreshIfExpired().then(access_token => {  // refresh token if expired
    const targetValence = 0.2; // decrease valence for a sad mood
    const targetDanceability = 0.2; // decrease danceability for a sad mood
    const targetEnergy = 0.2; // decrease energy for a sad mood

    const recommendationOptions = {  // spotify recommendation options
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=pop&target_valence=${targetValence}&target_danceability=${targetDanceability}&target_energy=${targetEnergy}`,  // API endpoint
      headers: {
        'Authorization': `Bearer ${access_token}`  // authorization token
      },
      json: true  // set the response data type as JSON
    };

    res.setHeader('Cache-Control', 'no-store'); // disable caching of the response

    request.get(recommendationOptions, (error, response, body) => {  // request to Spotify API
      if (response.statusCode === 200) {  // if the request is successful
        const trackDetails = body.tracks.map(track => {  // extract relevant track details
          return {
            uri: track.uri,  // track URI
            name: track.name,  // track name
            artist: track.artists[0].name,  // track artist
            albumCover: track.album.images[0].url  // track album cover
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);  // Sshuffle the track details
        const uniqueDetails = shuffledDetails.slice(0, 20);  // get the first 20 unique track details
        res.json(uniqueDetails);  // send the track details as the response
      } else {  // if the request fails
        console.error('Error generating playlist:', body.error.message);  // log the error message
        res.status(response.statusCode).json({ error: body.error.message });  // send the status code and error message as the response
      }
    });
  }).catch(error => {  // if theres an error refreshing the token
    console.error('Error refreshing access token:', error);  // log the error
    res.status(500).json({ error: 'Error refreshing access token.' });  // send a 500 status code and a message indicating there was an error refreshing the access token
  });
});

app.get('/generate-chill-playlist', (req, res) => {  // endpoint to generate chill playlist
  refreshIfExpired().then(access_token => {  // refresh token if expired
    const targetValence = 0.6;  // target valence for a chill mood
    const targetEnergy = 0.4;  // target energy for a chill mood

    const recommendationOptions = {  // spotify recommendation options
      url: `https://api.spotify.com/v1/recommendations?limit=50&seed_genres=ambient&target_valence=${targetValence}&target_energy=${targetEnergy}`,  // API endpoint
      headers: {
        'Authorization': `Bearer ${access_token}`  // authorization token
      },
      json: true  // set the response data type as JSON
    };

    res.setHeader('Cache-Control', 'no-store'); // disable caching of the response

    request.get(recommendationOptions, (error, response, body) => {  //request to Spotify API
      if (response.statusCode === 200) {  //if the request is successful
        const trackDetails = body.tracks.map(track => {  //extract relevant track details
          return {
            uri: track.uri,  //track URI
            name: track.name,  //track name
            artist: track.artists[0].name,  //track artist
            albumCover: track.album.images[0].url  //track album cover
          }
        });
        const shuffledDetails = shuffleArray(trackDetails);  // shuffle the track details
        const uniqueDetails = shuffledDetails.slice(0, 20);  // get the first 20 unique track details
        res.json(uniqueDetails);  // send the track details as the response
      } else {  // if the request fails
        console.error('Error generating playlist:', body.error.message);  // log the error message
        res.status(response.statusCode).json({ error: body.error.message });  // send the status code and error message as the response
      }
    });
  }).catch(error => {  // if theres an error refreshing the token
    console.error('Error refreshing access token:', error);  // log the error
    res.status(500).json({ error: 'Error refreshing access token.' });  //send a 500 status code and a message indicating there was an error refreshing the access token
  });
});