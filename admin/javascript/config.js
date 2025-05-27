// Server configuration
const config = {
  apiUrl:
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : "https://herdoza-fitness-api.onrender.com/api",

  // Add other configuration options here
  appName: "Herdoza Fitness Center",
  version: "1.0.0",
};

// Export config and apiUrl separately
export default config;
export const API_URL = config.apiUrl;
