//Create the variable for latitude


// window.onload = function(){
//     const date = new Date();
//     const dateString = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
//     document.getElementById('date').innerHTML = dateString;

// if ("geolocation" in navigator) {
//     navigator.geolocation.getCurrentPosition(success)

// } else {
//   console.log("Geolocation is not available in your browser.");
// }
// }



const btn = document.getElementById('connectBtn');
btn.addEventListener("click", function() {
  // Redirect the user to the Spotify authorization page
  window.location.href = 'http://localhost:3000/login';
});


// Function to hide an element
function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  }
  
  // Function to show an element
  function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('hidden');
    }
  }
  
  // Check if access token and refresh token are available in localStorage
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Function to handle successful authentication
  function handleAuthentication() {
    hideElement('connectBtn'); // Hide the "Connect" button
    showElement('newButton1'); // Show the new button 1
    showElement('newButton2'); // Show the new button 2
    showElement('newButton3'); // Show the new button 3
    showElement('newButton4'); // Show the new button 4
  }
  
  // Attach event listener to the "Connect" button
  const connectBtn = document.getElementById('connectBtn');
  connectBtn.addEventListener('click', () => {
    // Simulating successful authentication
    localStorage.setItem('accessToken', 'YOUR_ACCESS_TOKEN');
    localStorage.setItem('refreshToken', 'YOUR_REFRESH_TOKEN');
  
    handleAuthentication();
  });

// const btn = document.getElementById('getmood1');
// btn.addEventListener("click",function(){    
//     const xhr = new XMLHttpRequest();

//     xhr.open("GET", `http://localhost:3000/weather/${latitude}/${longitude}`);
//     xhr.send();

//     xhr.onload = function() {
// 	    const body = JSON.parse(xhr.responseText);
//         let temperature = body.temperature;
// 	    let weatherStatus = body.weatherStatus;
//         document.getElementById("temperature").innerHTML = `Temperature: ${temperature}\u00B0F`;
//         document.getElementById('weatherStatus').innerHTML = `weather Status: ${weatherStatus}`;
// }
// }

// const btn = document.getElementById('getmood2');
// btn.addEventListener("click",function(){    
//     const xhr = new XMLHttpRequest();

//     xhr.open("GET", `http://localhost:3000/weather/${latitude}/${longitude}`);
//     xhr.send();

//     xhr.onload = function() {
// 	    const body = JSON.parse(xhr.responseText);
//         let temperature = body.temperature;
// 	    let weatherStatus = body.weatherStatus;
//         document.getElementById("temperature").innerHTML = `Temperature: ${temperature}\u00B0F`;
//         document.getElementById('weatherStatus').innerHTML = `weather Status: ${weatherStatus}`;
// }
// }

// const btn = document.getElementById('getmood3');
// btn.addEventListener("click",function(){    
//     const xhr = new XMLHttpRequest();

//     xhr.open("GET", `http://localhost:3000/weather/${latitude}/${longitude}`);
//     xhr.send();

//     xhr.onload = function() {
// 	    const body = JSON.parse(xhr.responseText);
//         let temperature = body.temperature;
// 	    let weatherStatus = body.weatherStatus;
//         document.getElementById("temperature").innerHTML = `Temperature: ${temperature}\u00B0F`;
//         document.getElementById('weatherStatus').innerHTML = `weather Status: ${weatherStatus}`;
// }
// }

// const btn = document.getElementById('getmood4');
// btn.addEventListener("click",function(){    
//     const xhr = new XMLHttpRequest();

//     xhr.open("GET", `http://localhost:3000/weather/${latitude}/${longitude}`);
//     xhr.send();

//     xhr.onload = function() {
// 	    const body = JSON.parse(xhr.responseText);
//         let temperature = body.temperature;
// 	    let weatherStatus = body.weatherStatus;
//         document.getElementById("temperature").innerHTML = `Temperature: ${temperature}\u00B0F`;
//         document.getElementById('weatherStatus').innerHTML = `weather Status: ${weatherStatus}`;
// }
// }


//-------------------------------?-----------------------------------------
// const xhr2 = new XMLHttpRequest();
// xhr2.open("GET", `http://localhost:3000/5day/${latitude}/${longitude}`);
// xhr2.send();

// xhr2.onload = function() {
// 	const body = JSON.parse(xhr2.responseText);
// 	let forecast = body;
//     let forecastElements = document.getElementsByClassName("forecast");
// 	for (let i = 0; i < forecast.length; i++) {
// 		forecastElements[i].innerHTML = forecast[i].dayName + ": " + forecast[i].temp + "\u00B0F";
//         }
//     } 

// })
