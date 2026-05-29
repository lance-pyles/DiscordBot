import express from "express";
import { chromium } from "playwright";

const app = express();

app.use(express.json());

app.post("/webscreenshot", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000
    });

    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "png"
    });

    res.setHeader("Content-Type", "image/png");
    res.send(screenshotBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to capture screenshot", message: err.message });

  } finally {
    if (browser) await browser.close();
  }
});

app.listen(3000, () => {
  console.log("Screenshot API running on port 3000");
});
