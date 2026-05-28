const app = express();
const PORT = process.env.PORT || 3000;

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
