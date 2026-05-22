const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const result = document.getElementById("weatherResult");
const placeName = document.getElementById("placeName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const feelsLike = document.getElementById("feelsLike");

const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm"
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    showMessage("Please enter a city name.", true);
    return;
  }

  setLoading(true);
  result.classList.add("hidden");

  try {
    const location = await getLocation(city);
    const weather = await getWeather(location.latitude, location.longitude);
    showWeather(location, weather.current);
    showMessage("Live weather data loaded.");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    setLoading(false);
  }
});

async function getLocation(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not search for that city.");
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Try another city name.");
  }

  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new Error("Could not load weather data.");
  }

  return response.json();
}

function showWeather(location, current) {
  const country = location.country ? `, ${location.country}` : "";

  placeName.textContent = `${location.name}${country}`;
  temperature.textContent = Math.round(current.temperature_2m);
  condition.textContent = weatherCodes[current.weather_code] || "Weather information";
  windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  humidity.textContent = `${current.relative_humidity_2m}%`;
  feelsLike.textContent = `${Math.round(current.apparent_temperature)} C`;

  result.classList.remove("hidden");
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  const button = form.querySelector("button");

  button.disabled = isLoading;
  button.textContent = isLoading ? "Loading..." : "Search";
}
