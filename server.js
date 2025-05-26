// This file redirects to the actual server implementation in the backend folder
require("./backend/server.js");
app.use(
  express.static("IPT-TAILWIND", {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);
