const url = 'https://api.openweathermap.org/data/2.5/weather';
const apiKey = 'cf5a484bdfe23aa65588bd914171c3f7'; // Replace with your OpenWeatherMap API key
let map;  // Declare map variable globally
let marker;  // Marker for the location

$(document).ready(function () {
    // Initialize with the user's current location
    getCurrentLocation();
});

function getCurrentLocation() {
    if (navigator.geolocation) {
        // If geolocation is supported, get the user's current position
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeather(null, lat, lon);  // Get weather using current lat and lon
                initMap(lat, lon);  // Initialize the map at user's current location
            },
            error => {
                console.error('Error getting location:', error);
                handleLocationError();  // Handle the case when geolocation fails
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
        handleLocationError();  // Default to Noida if geolocation isn't supported
    }
}

function handleLocationError() {
    // Default to Noida if user denies location or there's an error
    getWeather('Noida');
    initMap(28.5355, 77.3910);  // Default map location to Noida
}

function getWeather(city = null, lat = null, lon = null) {
    let fullUrl;

    if (lat && lon) {
        // If latitude and longitude are provided, use them
        fullUrl = `${url}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        // If no lat/lon, use the city name (default to Noida)
        const cityName = city || $('#city-input').val() || 'Noida';
        fullUrl = `${url}?q=${cityName}&appid=${apiKey}&units=metric`;
    }

    // Fetch weather data from OpenWeatherMap API
    fetch(fullUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeather(data);  // Display the weather details
                // Update the map location with the city's coordinates
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                updateMap(lat, lon);
            } else {
                alert('City not found. Please try again.');
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function displayWeather(data) {
    // Display basic weather information
    $('#city-name').text(`Weather in ${data.name}`);
    $('#date').text(moment().format('MMMM Do YYYY, h:mm:ss a'));
    $('#temperature').html(`${data.main.temp}°C`);
    $('#description').text(data.weather[0].description);
    $('#weather-icon').attr('src', `http://openweathermap.org/img/w/${data.weather[0].icon}.png`);

    // Update wind speed, humidity, and pressure values
    $('#wind-value').text(data.wind.speed);
    $('#humidity-value').text(data.main.humidity);
    $('#pressure-value').text(data.main.pressure);

    // Show the weather information section
    $('#weather-info').removeClass('d-none');
}

function initMap(lat, lon) {
    // Initialize the map only if it hasn't been created already
    if (!map) {
        map = L.map('map').setView([lat, lon], 13);  // Set view to current lat and lon
    } else {
        map.setView([lat, lon], 13);  // If map exists, update the view
    }

    // Add map tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add a marker to the current location
    if (!marker) {
        marker = L.marker([lat, lon]).addTo(map);  // Create the marker
        marker.bindPopup("You are here!").openPopup();  // Add a popup to the marker
    }
}

function updateMap(lat, lon) {
    if (map) {
        // If map is initialized, update the view and marker position
        map.setView([lat, lon], 13);

        if (marker) {
            map.removeLayer(marker);  // Remove the old marker
        }

        marker = L.marker([lat, lon]).addTo(map);  // Add a new marker at new location
        marker.bindPopup(`Location: ${lat}, ${lon}`).openPopup();  // Update popup info
    } else {
        initMap(lat, lon);  // Initialize the map if it doesn't exist
    }
}
