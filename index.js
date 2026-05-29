const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/hello/:id', (req, res) => {
    messageText = req.body + ' Hello world from ' + req.params.id;
    res.json({
        message: messageText
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
