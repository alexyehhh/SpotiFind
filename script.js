// Get the connect button element and add a click event listener to it
const btn = document.getElementById('connectBtn');
btn.addEventListener("click", function() {
  // Redirect to the login page when the connect button is clicked
  window.location.href = 'http://localhost:3000/login';
});

// Function to hide an element by its ID or class name
function hideElement(elementIdOrClass) {
  let element = document.getElementById(elementIdOrClass);
  if (!element) {
    // If the element is not found by ID, try finding it by class name
    element = document.querySelector(`.${elementIdOrClass}`);
  }
  if (element) {
    // Hide the element by setting its display property to none
    element.style.display = 'none';
  }
}

// Function to hide all elements on the page
function hideAll() {
  // Hide various elements using their IDs or classes
  hideElement('applicationDescription');
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
    // Hide the emoji container element by setting its display property to none
    element.style.display = 'none';
  }
}

// Function to hide elements specific to the home page
function hideHome() {
  // Hide elements related to the home page
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
    // Hide the emoji container element by setting its display property to none
    element.style.display = 'none';
  }
}

// Function to show an element by its ID
function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    // Show the element by setting its display property to block
    element.style.display = 'block';
  }
}

// Function to show the emoji container element
function showEmojiContainer() {
  const element = document.querySelector('.emojis');
  if (element) {
    // Show the emoji container element by setting its display property to flex
    element.style.display = 'flex';
  }
}

// Function to handle authentication
function handleAuthentication() {
  // Hide the connect button and show elements related to authenticated state
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

// Get the connect button element again
const connectBtn = document.getElementById('connectBtn');
connectBtn.addEventListener('click', () => {
  // Store the access token and refresh token in the local storage when the connect button is clicked
  localStorage.setItem('accessToken', getAccessToken());
  localStorage.setItem('refreshToken', getRefreshToken());
});

// Run the following code when the window finishes loading
window.onload = function() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const urlParams = new URLSearchParams(window.location.search);
  const isAuthenticated = urlParams.get('authenticated');

  if (accessToken && refreshToken || isAuthenticated === 'true') {
    // If access token and refresh token are present or the user is authenticated, handle the authentication
    handleAuthentication();
  } else {
    // Otherwise, hide elements specific to the home page
    hideHome();
  }
};

// Function to handle button clicks for generating playlists
function handleNewButtonClick(url) {
  // Make a fetch request to the specified URL
  fetch(url, {
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
      // If trackDetails is an array, hide all elements, display the playlist container, and populate the playlist
      hideAll();
      const playlistContainer = document.getElementById('playlistContainer');
      if (playlistContainer) {
        playlistContainer.style.display = 'block';
      }
      const playlist = document.getElementById('playlist');
      playlist.innerHTML = '';
      trackDetails.forEach(track => {
        // Create a list item for each track and append it to the playlist
        const listItem = document.createElement('li');
        listItem.innerHTML = `<img src="${track.albumCover}" class="album-cover"><span>${track.name} by ${track.artist}</span>`;
        playlist.appendChild(listItem);
      });
      // Prompt the user to enter a name for the playlist
      const playlistName = prompt('Enter a name for your playlist:');
      const playlistNameElement = document.getElementById('playlistName');
      playlistNameElement.textContent = playlistName;
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
      // If the playlist is successfully exported, show an alert message
      alert('Playlist successfully exported!');
    } else {
      throw new Error('Failed to export the playlist.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    // Display an alert for any errors that occurred during playlist generation
    alert("There was an error generating your playlist. Please try again later.");
  });
}

// Add click event listeners to the new buttons, each invoking the handleNewButtonClick function with a specific URL
document.getElementById("newButton1").addEventListener("click", function() {
  handleNewButtonClick('http://localhost:3000/generate-happy-playlist');
});

document.getElementById("newButton2").addEventListener("click", function() {
  handleNewButtonClick('http://localhost:3000/generate-excited-playlist');
});

document.getElementById("newButton3").addEventListener("click", function() {
  handleNewButtonClick('http://localhost:3000/generate-sad-playlist');
});

document.getElementById("newButton4").addEventListener("click", function() {
  handleNewButtonClick('http://localhost:3000/generate-chill-playlist');
});
