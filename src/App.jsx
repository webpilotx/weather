import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./index.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Weather() {
  const [weather, setWeather] = useState(null);
  const [hourlyRain, setHourlyRain] = useState(Array(24).fill(0));
  const [dailyForecast, setDailyForecast] = useState([]);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Get current date
    const date = new Date();
    setCurrentDate(date.toDateString());

    // Fetch weather data
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const weatherResponse = await fetch(
            `/weather/api/current?lat=${latitude}&lon=${longitude}`
          );
          const weatherData = await weatherResponse.json();
          setWeather(weatherData);

          const forecastResponse = await fetch(
            `/weather/api/forecast?lat=${latitude}&lon=${longitude}`
          );
          const forecastData = await forecastResponse.json();

          // Extract hourly rain chance
          const rainData = Array(24).fill(0);
          forecastData.list.forEach((hour) => {
            const hourIndex = new Date(hour.dt * 1000).getHours();
            rainData[hourIndex] = hour.pop * 100; // Probability of precipitation (pop) is a percentage
          });
          setHourlyRain(rainData);

          // Extract daily forecast summary
          const dailyData = {};
          forecastData.list.forEach((entry) => {
            const date = new Date(entry.dt * 1000).toDateString();
            if (!dailyData[date]) {
              dailyData[date] = {
                minTemp: entry.main.temp_min,
                maxTemp: entry.main.temp_max,
                condition: entry.weather[0].description,
              };
            } else {
              dailyData[date].minTemp = Math.min(
                dailyData[date].minTemp,
                entry.main.temp_min
              );
              dailyData[date].maxTemp = Math.max(
                dailyData[date].maxTemp,
                entry.main.temp_max
              );
            }
          });
          setDailyForecast(Object.entries(dailyData));
        } catch (err) {
          setError("Failed to fetch weather data.");
        }
      },
      () => {
        setError("Failed to get location.");
      }
    );
  }, []);

  // Prepare data for the hourly rain chart
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), // Labels from 0:00 to 23:00
    datasets: [
      {
        label: "Rain Chance (%)",
        data: hourlyRain,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Hourly Rain Chance",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hour of the Day",
        },
      },
      y: {
        title: {
          display: true,
          text: "Rain Chance (%)",
        },
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mt-8">Weather Forecast</h1>
      <p className="text-lg mt-2">{currentDate}</p>
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
      <div className="mt-8 w-3/4">
        {hourlyRain.length > 0 && (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
      <div className="mt-8 w-3/4">
        <h2 className="text-2xl font-bold mt-8">Daily Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {dailyForecast.map(([date, data]) => (
            <div
              key={date}
              className="p-4 bg-gray-800 rounded-lg shadow-lg text-center"
            >
              <h3 className="text-lg font-bold">{date}</h3>
              <p>Min Temp: {data.minTemp}°C</p>
              <p>Max Temp: {data.maxTemp}°C</p>
              <p>Condition: {data.condition}</p>
            </div>
          ))}
        </div>
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
