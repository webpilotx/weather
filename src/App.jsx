import { useEffect, useState } from "react";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import "./index.css";

function Weather() {
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
      <h1 className="text-5xl font-bold mt-8">Current Weather</h1>
      <div className="mt-8">
        {error && <p className="text-red-500">{error}</p>}
        {weather ? (
          <div>
            <h2 className="text-2xl font-bold">Weather Details</h2>
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Weather />} />
      </Routes>
    </Router>
  );
}

export default App;
