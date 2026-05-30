import express from "express";

const app = express();

app.get("/test", async (req, res) => { "success"; });

app.listen(3000, () => { console.log("Screenshot API running on port 3000"); });
