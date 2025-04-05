import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import reactLogo from "./assets/react.svg";
import "./index.css";
import viteLogo from "/vite.svg";

function App() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `/weather/api/current?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setWeather(data);
        } catch (err) {
          setError("Failed to fetch weather data.");
        }
      },
      () => {
        setError("Failed to get location.");
      }
    );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex space-x-4">
        <a href="https://vite.dev" target="_blank">
          <img
            src={viteLogo}
            className="h-24 p-6 transition-transform hover:scale-110"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="h-24 p-6 transition-transform hover:scale-110"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-5xl font-bold mt-8">Vite + React</h1>
      <div className="card mt-6 p-6 bg-gray-800 rounded-lg shadow-lg">
        <p className="mt-4 text-gray-400">
          Edit <code className="text-blue-400">src/main.jsx</code> and save to
          test HMR
        </p>
      </div>
      <p className="mt-6 text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
      <div className="mt-8">
        {error && <p className="text-red-500">{error}</p>}
        {weather ? (
          <div>
            <h2 className="text-2xl font-bold">Current Weather</h2>
            <p>Location: {weather.name}</p>
            <p>Temperature: {weather.main.temp}°C</p>
            <p>Condition: {weather.weather[0].description}</p>
          </div>
        ) : (
          !error && <p>Loading weather data...</p>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
