document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dateDisplay = document.getElementById('date-display');
    const locationDisplay = document.getElementById('location-display');
    const tempValue = document.getElementById('temp-value');
    const weatherDescription = document.getElementById('weather-description');
    const weatherIcon = document.getElementById('weather-icon');
    const spinner = document.getElementById('loading-spinner');
    const weatherContent = document.getElementById('weather-content');
    const refreshBtn = document.getElementById('refresh-btn');

    // Default Location: Seoul
    const DEFAULT_LAT = 37.566;
    const DEFAULT_LON = 126.978;

    // Initialize
    updateDate();
    getWeather();

    // Event Listeners
    refreshBtn.addEventListener('click', () => {
        showLoading();
        getWeather();
    });

    // Functions
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    function showLoading() {
        weatherContent.classList.add('hidden');
        spinner.classList.remove('hidden');
    }

    function hideLoading() {
        spinner.classList.add('hidden');
        weatherContent.classList.remove('hidden');
    }

    function getWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    locationDisplay.innerHTML = `<i class='bx bx-current-location'></i> Current Location`;
                    fetchWeatherData(lat, lon);
                },
                (error) => {
                    console.warn("Geolocation error, using default location (Seoul)", error);
                    locationDisplay.innerHTML = `<i class='bx bx-map'></i> Seoul, KR`;
                    fetchWeatherData(DEFAULT_LAT, DEFAULT_LON);
                }
            );
        } else {
            locationDisplay.innerHTML = `<i class='bx bx-map'></i> Seoul, KR`;
            fetchWeatherData(DEFAULT_LAT, DEFAULT_LON);
        }
    }

    async function fetchWeatherData(lat, lon) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Weather data fetch failed');
            }

            const data = await response.json();
            const current = data.current_weather;
            
            updateUI(current);
            hideLoading();
            
        } catch (error) {
            console.error(error);
            weatherDescription.textContent = 'Failed to load weather';
            hideLoading();
        }
    }

    function updateUI(current) {
        // Temperature
        tempValue.textContent = Math.round(current.temperature);
        
        // Weather Code mapping
        const code = current.weathercode;
        let iconClass = 'bx-sun';
        let description = 'Clear';
        let theme = 'theme-clear';

        if (code === 0) {
            iconClass = 'bx-sun';
            description = 'Clear Sky';
            theme = 'theme-clear';
        } else if (code >= 1 && code <= 3) {
            iconClass = 'bx-cloud';
            description = 'Cloudy';
            theme = 'theme-cloudy';
        } else if (code === 45 || code === 48) {
            iconClass = 'bx-water';
            description = 'Foggy';
            theme = 'theme-cloudy';
        } else if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
            iconClass = 'bx-cloud-rain';
            description = 'Rainy';
            theme = 'theme-rain';
        } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
            iconClass = 'bx-cloud-snow';
            description = 'Snowy';
            theme = 'theme-snow';
        } else if (code >= 95 && code <= 99) {
            iconClass = 'bx-cloud-lightning';
            description = 'Thunderstorm';
            theme = 'theme-rain';
        }

        // Apply
        weatherIcon.className = `bx ${iconClass}`;
        weatherDescription.textContent = description;
        document.body.className = theme;
    }
});
