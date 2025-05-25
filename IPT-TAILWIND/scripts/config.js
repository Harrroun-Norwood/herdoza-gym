const config = {
  apiUrl:
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : "https://herdoza-fitness-api.onrender.com/api",
};

export default config;
