const btn = document.getElementById('connectBtn');
btn.addEventListener("click", function() {
  window.location.href = 'http://localhost:3000/login';
});

function hideAll() {
  hideElement('applicationDescription');
  hideElement('connectDescription');
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

function hideHome() {
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

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

function showEmojiContainer() {
  const element = document.querySelector('.emojis');
  if (element) {
    element.style.display = 'flex';
  }
}

function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}

function handleAuthentication() {
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

const connectBtn = document.getElementById('connectBtn');
connectBtn.addEventListener('click', () => {
  localStorage.setItem('accessToken', getAccessToken());
  localStorage.setItem('refreshToken', getRefreshToken());
});

window.onload = function() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const urlParams = new URLSearchParams(window.location.search);
  const isAuthenticated = urlParams.get('authenticated');

  if (accessToken && refreshToken || isAuthenticated === 'true') {
    handleAuthentication();
  } else {
    hideHome();
  }
};

document.getElementById("newButton1").addEventListener("click", function() {
  fetch('http://localhost:3000/generate-happy-playlist', {
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
