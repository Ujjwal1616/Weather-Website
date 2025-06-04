// L4YSAK3te7c3EKwYDA7qIpRH4yNQ6KI9paQ3xKJ6JUa8PwZZ60PQjxtS
// f4e9d4ea88a919a40683d7ff340f995d


import React, { useState, useEffect, useRef } from "react"; 
// useState is used to create and manage dynamic values (like city name, weather info, image URLs)
// useEffect is used to run code when the component loads or when specific values change
// useRef is used to store a value (like a timer) that won’t cause re-renders when it changes

import "./App.css"; // Importing CSS styles
import defaultBackground from "./imag.1.jpg"; // A default image stored in the src folder to show initially

// This function defines your main React component: "App"
function App() {
  // City name entered by the user
  const [city, setCity] = useState("");

  // Stores the weather information fetched from the API
  const [weather, setWeather] = useState(null);

  // Stores any error messages (e.g. city not found)
  const [error, setError] = useState("");

  // An array of image URLs fetched from the Pexels API for the given city
  const [imageUrls, setImageUrls] = useState([]);

  // Keeps track of which city image is currently being shown
  const [currentIndex, setCurrentIndex] = useState(0);

  // A reference to the image slideshow timer (used to clear it later)
  const intervalRef = useRef(null);

  // API keys (replace with your real keys)
  const WEATHER_API_KEY = "f4e9d4ea88a919a40683d7ff340f995d"; // Your OpenWeatherMap API key
  const PEXELS_ACCESS_KEY = "L4YSAK3te7c3EKwYDA7qIpRH4yNQ6KI9paQ3xKJ6JUa8PwZZ60PQjxtS"; // Your Pexels API key

  // 🔍 Fetch city images from the Pexels API
  const getCityImages = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${cityName}&orientation=landscape&per_page=10`, // asks for 5 landscape photos of the city
        {
          headers: {
            Authorization: PEXELS_ACCESS_KEY, // Required for Pexels API
          },
        }   
      );
      const data = await res.json();

      // If photos are found, extract their image URLs
      if (data.photos && data.photos.length > 0) {
        const urls = data.photos.map((photo) => photo.src.large2x); // large2x gives high-resolution images
        setImageUrls(urls); // Save image URLs to state
        setCurrentIndex(0); // Start slideshow from first image
      } else {
        setImageUrls([]); // No images found
      }
    } catch (error) {
      setImageUrls([]); // In case of fetch error
    }
  };

  // 🌤️ Fetch weather information for the city from OpenWeatherMap
  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      setWeather(null);
      setImageUrls([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
      );

      const data = await response.json();

      if (data.cod === 200) {
        // Success: store weather data and fetch related images
        setWeather(data);
        setError("");
        getCityImages(city);
      } else {
        // If the city name is incorrect or not found
        setError("City not found. Try again.");
        setWeather(null);
        setImageUrls([]);
      }
    } catch (err) {
      // Network or API error
      setError("Error fetching weather data.");
      setWeather(null);
      setImageUrls([]);
    }
  };

  // 🔄 Cycle through images every 5 seconds
  useEffect(() => {
    if (imageUrls.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
      }, 5000); // 5000 milliseconds = 5 seconds

      return () => clearInterval(intervalRef.current); // Cleanup
    } else {
      clearInterval(intervalRef.current); // Stop slideshow if only one or no image
    }
  }, [imageUrls]);

  // ⏱️ Format timezone offset to UTC format (e.g. UTC +5:30)
  const formatTimezone = (offset) => {
    const hours = Math.floor(Math.abs(offset) / 3600);
    const minutes = (Math.abs(offset) % 3600) / 60;
    const sign = offset >= 0 ? "+" : "-";
    return `UTC ${sign}${hours}:${minutes === 0 ? "00" : minutes}`;
  };

  // 🎨 Determine which background image to show (either slideshow or default)
  const backgroundImageUrl =
    imageUrls.length > 0 ? imageUrls[currentIndex] : defaultBackground;

  // 📦 JSX Return: how the UI looks
  return (
    <div
      className="app-container"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // ensures full screen
        width: "100%",
      }}
    >
      <div
        className={`overlay ${
          weather ? "overlay-after-search" : "overlay-before-search"
        }`}
      >
        <h1 className="title">🌆 Weather & City View</h1>

        {/* Search box: user enters city name here */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather()} // Enter key triggers search
          />
          <button onClick={getWeather}>Search</button>
        </div>

        {/* Error message, if any */}
        {error && <p className="error">{error}</p>}

        {/* Weather info card (only shown after search) */}
        {weather && (
          <div className="weather-info">
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="weather icon"
            />
            <p>
              <strong>{weather.weather[0].main}</strong> -{" "}
              {weather.weather[0].description}
            </p>
            <p>
              <strong>Temperature:</strong> {weather.main.temp} °C
            </p>
            <p>
              <strong>Min:</strong> {weather.main.temp_min} °C |{" "}
              <strong>Max:</strong> {weather.main.temp_max} °C
            </p>
            <p>
              <strong>Humidity:</strong> {weather.main.humidity}%
            </p>
            <p>
              <strong>Timezone:</strong> {formatTimezone(weather.timezone)}
              {/* formatTimezone() turns seconds into UTC +X:XX */}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Make the App component usable in index.js
export default App;
