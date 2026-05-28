const express = require('express');

const PORT = process.env.PORT || 3000;

app.get('/hello/:id', (req, res) => {
    messageText = 'Hello world from ' + req.params.id;
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
