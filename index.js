const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// For parsing application/json
app.use(express.json()); 

// For parsing application/x-www-form-urlencoded (standard HTML forms)
app.use(express.urlencoded({ extended: true })); 

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
