const http = require("http");

const port = Number(process.env.PORT || 5000);

const request = http.get(
  {
    hostname: "127.0.0.1",
    port,
    path: "/api/health",
    timeout: 4000,
  },
  (response) => {
    response.resume();

    if (response.statusCode >= 200 && response.statusCode < 400) {
      process.exit(0);
    }

    console.error(
      `Health check returned HTTP ${response.statusCode}`
    );
    process.exit(1);
  }
);

request.on("timeout", () => {
  request.destroy(new Error("Health check timed out"));
});

request.on("error", (error) => {
  console.error(`Health check failed: ${error.message}`);
  process.exit(1);
});
