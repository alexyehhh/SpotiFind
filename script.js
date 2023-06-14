const btn = document.getElementById('connectBtn'); // get the element 
btn.addEventListener("click", function() { // add a click event listener 
  window.location.href = 'http://localhost:3000/login'; // redirect to the login page when the button is clicked
});

function hideAll() { //Hide everything for the playlsit page 
  hideElement('applicationDescription'); 
  showElement('playlistContainer'); 
  hideElement('connectDescription'); 
  hideElement('wave');
  hideElement('ocean'); 
  hideElement('connectBtn'); 
  hideElement('newButton1'); 
  hideElement('newButton2'); 
  hideElement('newButton3'); 
  hideElement('newButton4'); 
  hideElement('emote1'); 
  hideElement('emote2'); 
  hideElement('emote3'); 
  hideElement('emote4'); 
  hideElement('playlistContainer'); 
  const element = document.querySelector('.emojis'); 
  if (element) {
    element.style.display = 'none'; 
  }
}

function hideElement(elementIdOrClass) {
  let element = document.getElementById(elementIdOrClass); // get the element with the specified ID
  
  // if element not found by ID, try class
  if (!element) {
    element = document.querySelector(`.${elementIdOrClass}`); // get the element with the specified class
  }
  
  if (element) {
    element.style.display = 'none'; // hide the element
  }
}

function hideHome() { //Hide elements for when on homepage
  hideElement('newButton1'); 
  hideElement('newButton2'); 
  hideElement('newButton3'); 
  hideElement('newButton4'); 
  hideElement('emote1'); 
  hideElement('emote2'); 
  hideElement('emote3'); 
  hideElement('emote4'); 
  hideElement('playlistContainer'); 
  const element = document.querySelector('.emojis'); 
  if (element) {
    element.style.display = 'none'; 
  }
}

function showEmojiContainer() {
  const element = document.querySelector('.emojis'); // Ggt the element with the class 'emojis'
  if (element) {
    element.style.display = 'flex'; // show the element with the class 'emojis'
  }
}

function showElement(elementId) {
  const element = document.getElementById(elementId); // get the element with the specified ID
  if (element) {
    element.style.display = 'block'; // show the element
  }
}

function handleAuthentication() { //Once authorized hide connect button and display emote buttons 
  hideElement('connectBtn'); 
  showElement('newButton1'); 
  showElement('newButton2'); 
  showElement('newButton3'); 
  showElement('newButton4'); 
  showElement('emote1');
  showElement('emote2'); 
  showElement('emote3'); 
  showElement('emote4'); 
  hideElement('connectDescription'); 
  showEmojiContainer(); 
}

const connectBtn = document.getElementById('connectBtn'); // Get the element 
connectBtn.addEventListener('click', () => { // add a click event listener 
  localStorage.setItem('accessToken', getAccessToken()); // store the access token in the local storage
  localStorage.setItem('refreshToken', getRefreshToken()); // store the refresh token in the local storage
});

window.onload = function() {
  const accessToken = localStorage.getItem('accessToken'); // get the access token from the local storage
  const refreshToken = localStorage.getItem('refreshToken'); // get the refresh token from the local storage

  const urlParams = new URLSearchParams(window.location.search); // get the URL parameters
  const isAuthenticated = urlParams.get('authenticated'); // get the value of the authenticated parameter

  if (accessToken && refreshToken || isAuthenticated === 'true') { // check if access token and refresh token exist or isAuthenticated is true
    handleAuthentication(); // call the handleAuthentication function
  } else {
    hideHome(); // call the hideHome function
  }
};

document.getElementById("newButton1").addEventListener("click", function() { // add a click event listener 
  fetch('http://localhost:3000/generate-happy-playlist', { // fetch data from the specified URL
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // include the access token in the request headers
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok'); //throw an error if the response is not successful
    }
    return response.json(); // return the response data as JSON
  })
  .then(trackDetails => {
    if (Array.isArray(trackDetails)) { // check if trackDetails is an array
      hideAll(); // call the hideAll function

      const playlistContainer = document.getElementById('playlistContainer'); // get the element 
      if (playlistContainer) {
        playlistContainer.style.display = 'block'; // show the element 
      }

      const playlist = document.getElementById('playlist'); // get the element 
      playlist.innerHTML = ''; // Clear the playlist

      trackDetails.forEach(track => { // loop through the track details
        const listItem = document.createElement('li'); // create a new list item element
        listItem.innerHTML = `<img src="${track.albumCover}" class="album-cover"><span>${track.name} by ${track.artist}</span>`; // Set the inner HTML of the list item
        playlist.appendChild(listItem); // Append the list item to the playlist
      });

      const playlistName = prompt('Enter a name for your playlist:'); // Prompt the user to enter a playlist name
      return fetch('http://localhost:3000/export-playlist', { // Fetch data from the specified URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Include the access token in the request headers
        },
        body: JSON.stringify({
          playlistName: playlistName,
          trackURIs: trackDetails.map(track => track.uri) // Convert trackDetails to an array of track URIs
        })
      });
    } else {
      console.error('Error: trackURIs is not an array:', trackDetails); // Log an error if trackURIs is not an array
    }
  })
  .then(response => {
    if (response.ok) {
      alert('Playlist successfully exported!'); // Display a success message
    } else {
      throw new Error('Failed to export the playlist.'); // Throw an error if playlist export fails
    }
  })
  .catch(error => {
    console.error('Error:', error); // Log any errors
    alert("There was an error generating your playlist. Please try again later."); // Display an error message to the user
  });
});

//Do the same for rest of buttons below just changing criteria 


document.getElementById("newButton2").addEventListener("click", function() {
  fetch('http://localhost:3000/generate-excited-playlist', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(trackDetails => {
    if (Array.isArray(trackDetails)) {
      hideAll();

      const playlistContainer = document.getElementById('playlistContainer');
      if (playlistContainer) {
        playlistContainer.style.display = 'block';
      }

      const playlist = document.getElementById('playlist');
      playlist.innerHTML = '';

      trackDetails.forEach(track => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<img src="${track.albumCover}" class="album-cover"><span>${track.name} by ${track.artist}</span>`;
        playlist.appendChild(listItem);
      });

      const playlistName = prompt('Enter a name for your playlist:');
      return fetch('http://localhost:3000/export-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          playlistName: playlistName,
          trackURIs: trackDetails.map(track => track.uri)
        })
      });
    } else {
      console.error('Error: trackURIs is not an array:', trackDetails);
    }
  })
  .then(response => {
    if (response.ok) {
      alert('Playlist successfully exported!');
    } else {
      throw new Error('Failed to export the playlist.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert("There was an error generating your playlist. Please try again later.");
  });
});


document.getElementById("newButton3").addEventListener("click", function() {
  fetch('http://localhost:3000/generate-sad-playlist', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(trackDetails => {
    if (Array.isArray(trackDetails)) {
      hideAll();

      const playlistContainer = document.getElementById('playlistContainer');
      if (playlistContainer) {
        playlistContainer.style.display = 'block';
      }

      const playlist = document.getElementById('playlist');
      playlist.innerHTML = '';

      trackDetails.forEach(track => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<img src="${track.albumCover}" class="album-cover"><span>${track.name} by ${track.artist}</span>`;
        playlist.appendChild(listItem);
      });

      const playlistName = prompt('Enter a name for your playlist:');
      return fetch('http://localhost:3000/export-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          playlistName: playlistName,
          trackURIs: trackDetails.map(track => track.uri)
        })
      });
    } else {
      console.error('Error: trackURIs is not an array:', trackDetails);
    }
  })
  .then(response => {
    if (response.ok) {
      alert('Playlist successfully exported!');
    } else {
      throw new Error('Failed to export the playlist.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert("There was an error generating your playlist. Please try again later.");
  });
});


document.getElementById("newButton4").addEventListener("click", function() {
  fetch('http://localhost:3000/generate-chill-playlist', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(trackDetails => {
    if (Array.isArray(trackDetails)) {
      hideAll();

      const playlistContainer = document.getElementById('playlistContainer');
      if (playlistContainer) {
        playlistContainer.style.display = 'block';
      }

      const playlist = document.getElementById('playlist');
      playlist.innerHTML = '';

      trackDetails.forEach(track => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<img src="${track.albumCover}" class="album-cover"><span>${track.name} by ${track.artist}</span>`;
        playlist.appendChild(listItem);
      });

      const playlistName = prompt('Enter a name for your playlist:');
      return fetch('http://localhost:3000/export-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          playlistName: playlistName,
          trackURIs: trackDetails.map(track => track.uri)
        })
      });
    } else {
      console.error('Error: trackURIs is not an array.');
      throw new Error('trackURIs is not an array.');
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(playlist => {
    document.getElementById('playlistLink').href = playlist.external_urls.spotify;
    document.getElementById('playlistCover').src = playlist.images[0].url;
    document.getElementById('playlistCover').style.display = 'block';
    document.getElementById('playlistLink').style.display = 'block';
  })
  .catch(error => {
    console.error('Error:', error);
  });
});