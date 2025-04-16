// OpenWeatherMap API Key - Replace with your own
const apiKey = '359323442a3d4a7f39b5c41d3de1d0ca';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const dateTime = document.getElementById('date-time');
const temp = document.getElementById('temp');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const datalist = document.getElementById('city-suggestions');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Default city on load
    fetchWeather('London');
    
    // Setup event listeners
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
    
    // Setup autocomplete
    setupAutocomplete();
});

// Search weather function
function searchWeather() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
}

// Fetch weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'City not found');
        }
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error('Error fetching weather:', error);
    }
}

// Display weather data
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temp.textContent = Math.round(data.main.temp);
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    description.textContent = data.weather[0].description;
    
    // Update date and time
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
    
    // Update weather icon
    updateWeatherIcon(data.weather[0].main);
}

// Update weather icon
function updateWeatherIcon(weatherCondition) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Smoke': 'fa-smog',
        'Haze': 'fa-smog',
        'Dust': 'fa-smog',
        'Fog': 'fa-smog',
        'Sand': 'fa-smog',
        'Ash': 'fa-smog',
        'Squall': 'fa-wind',
        'Tornado': 'fa-tornado'
    };

    const defaultIcon = 'fa-question';
    const iconClass = iconMap[weatherCondition] || defaultIcon;
    
    weatherIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    
    // Change icon color based on weather
    if (weatherCondition === 'Clear') {
        weatherIcon.style.color = '#ffcc00';
    } else if (weatherCondition === 'Rain' || weatherCondition === 'Drizzle') {
        weatherIcon.style.color = '#4facfe';
    } else if (weatherCondition === 'Thunderstorm') {
        weatherIcon.style.color = '#ff6b6b';
    } else {
        weatherIcon.style.color = '#ffffff';
    }
}

// Autocomplete functionality
function setupAutocomplete() {
    cityInput.addEventListener('input', debounce(handleInput, 300));
    cityInput.addEventListener('focus', () => {
        if (cityInput.value.length >= 3) {
            datalist.style.display = 'block';
        }
    });
    cityInput.addEventListener('blur', () => {
        setTimeout(() => {
            datalist.style.display = 'none';
        }, 200);
    });
}

async function handleInput(e) {
    const query = e.target.value.trim();
    if (query.length < 3) {
        datalist.style.display = 'none';
        return;
    }
    
    try {
        const suggestions = await fetchCitySuggestions(query);
        updateSuggestions(suggestions);
        datalist.style.display = 'block';
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

async function fetchCitySuggestions(query) {
    const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    
    const data = await response.json();
    return data.map(city => ({
        name: `${city.name}, ${city.country}`,
        value: `${city.name}, ${city.state || ''}, ${city.country}`.replace(', ,', ',')
    }));
}

function updateSuggestions(suggestions) {
    datalist.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion.value;
        option.textContent = suggestion.name;
        datalist.appendChild(option);
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}