// Server configuration
const config = {
  apiUrl:
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : "https://herdoza-fitness-gym.onrender.com/api",

  // Add other configuration options here
  appName: "Herdoza Fitness Center",
  version: "1.0.0",
};

export default config;
