const config = {
  apiUrl:
    process.env.NODE_ENV === "production"
      ? "https://herdoza-fitness-api.onrender.com/api"
      : "http://localhost:3000/api",
};

export default config;
