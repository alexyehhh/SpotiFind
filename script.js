const btn = document.getElementById('connectBtn');
btn.addEventListener("click", function() {
  window.location.href = 'http://localhost:3000/login';
});


// function to hide an element
function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

// function to show an element
function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}

  
  // check if access token and refresh token are available in localStorage
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Function to handle successful authentication

  // if success run this
  function handleAuthentication() {
    hideElement('connectBtn'); // hide the "Connect" button
    showElement('newButton1'); // show the new button 1
    showElement('newButton2'); // show the new button 2
    showElement('newButton3'); // show the new button 3
    showElement('newButton4'); // show the new button 4
  }
  
  // Attach event listener to the "Connect" button
  const connectBtn = document.getElementById('connectBtn');
  connectBtn.addEventListener('click', () => {
    localStorage.setItem('accessToken', 'YOUR_ACCESS_TOKEN');// simulating successful authentication
    localStorage.setItem('refreshToken', 'YOUR_REFRESH_TOKEN');
  
   // handleAuthentication();
  });


  window.onload = function() {
    // check if access token and refresh token are available in localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
  
    if (accessToken && refreshToken) {
      handleAuthentication();
    }
    // else part removed
  };

/*
// Retrieve access token from localStorage
const accessToken = localStorage.getItem('accessToken');

function getRecommendations(minDanceability, maxDanceability, minEnergy, maxEnergy, minInstrumentalness, maxInstrumentalness) {
  // Prepare the API request URL with the specified parameters
  const url = `https://api.spotify.com/v1/recommendations?seed_genres=pop&min_danceability=${minDanceability}&max_danceability=${maxDanceability}&min_energy=${minEnergy}&max_energy=${maxEnergy}&min_instrumentalness=${minInstrumentalness}&max_instrumentalness=${maxInstrumentalness}`;

  // Send the API request
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
    .then(response => response.json())
    .then(data => {
      // Handle the recommended tracks data
      const tracks = data.tracks;
      const randomSongs = getRandomSongs(tracks, 5); // Example: Select 5 random songs

      // Get the user's Spotify user ID
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
        .then(response => response.json())
        .then(userData => {
          const userId = userData.id;
          console.log('User ID:', userId);

          // Call the addSongsToPlaylist function with the random songs and user ID
          addSongsToPlaylist(randomSongs, userId);
        })
        .catch(error => {
          // Handle any errors
          console.error(error);
        });
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
    });
}

function addSongsToPlaylist(songs, userId) {
  // Create the playlist
  fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'name': 'My Random Playlist',
      'description': 'A playlist created by SpotiFind',
      'public': true
    })
  })
    .then(response => response.json())
    .then(playlistData => {
      const playlistId = playlistData.id;

      // Create an array of track URIs
      const uris = songs.map(song => song.uri);

      // Add songs to the playlist
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'uris': uris
        })
      })
        .then(response => {
          if (response.ok) {
            console.log('Songs added to the playlist successfully!');
          } else {
            console.log('Failed to add songs to the playlist.');
          }
        })
        .catch(error => {
          // Handle any errors
          console.error(error);
        });
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
    });
}

// Example usage of getRecommendations function
//getRecommendations(0.5, 0.8, 0.4, 0.7, 0.1, 0.5);

*/