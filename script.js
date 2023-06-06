
const btn = document.getElementById('connectBtn');
btn.addEventListener("click", function() {
  window.location.href = 'http://localhost:3000/login';// redirect the user to the Spotify authorization page
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
    const urlParams = new URLSearchParams(window.location.search);
    const isAuthenticated = urlParams.get('authenticated');

  
    if (isAuthenticated === 'true') { //access token check 
      handleAuthentication();
    }
    else {
      res.redirect('https://alexyehhh.github.io/spotifind/');
    }

  };