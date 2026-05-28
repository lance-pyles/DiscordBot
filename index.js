import express = from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

import fetch from "node-fetch";
import { JSDOM } from "jsdom";

const url = "https://bid13.com/auctions?postal_code=98223&distance=200&search_sort=0";

const res = await fetch(url);
const html = await res.text();

const dom = new JSDOM(html);
const document = dom.window.document;

const items = document.querySelectorAll("ul li");

const csv = [...items]
  .map(li => `"${li.textContent.trim().replace(/"/g, '""')}"`)
  .join("\n");

app.get('/hello/:id', (req, res) => {
    messageText = 'Hello world from ' + req.params.id;
    res.json({
        message: csv
    });
});

app.get('/goodbye', (req, res) => {
    res.json({
        message: 'FuCk ofF!'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
