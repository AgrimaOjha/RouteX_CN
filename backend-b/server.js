const express = require("express");

const app = express();
const PORT = 3002;

app.get("/", (req, res) => {
  res.set("X-Backend", "B");
  res.set("Cache-Control", "max-age=60");

  res.json({
    backend: "B",
    status: "ok",
    message: "RouteX Backend B is running"
  });
});

app.get("/api/status", (req, res) => {
  res.set("X-Backend", "B");
  res.set("Cache-Control", "max-age=60");

  res.json({
    backend: "B",
    status: "ok"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RouteX Backend B running on port ${PORT}`);
});
