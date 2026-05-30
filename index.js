const express = require('express');

const app = express();

// Parse JSON request bodies
app.use(express.json());

app.get("/test", async (req, res) => {

  const name = req.query.name ?? req.body.name;
  const lname = req.query.lname ?? req.body.lname;
  
  res.json({message: 'Hello, ' + name + ' ' + lname + '!'});

});

app.listen(3000, () => { console.log("Screenshot API running on port 3000"); });
