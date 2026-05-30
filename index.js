import express from "express";

const app = express();

app.get("/test", async (req, res) => {

  const name = req.query.name;
  const lname = req.query.lname;
  
  res.json({message: 'Hello, ' + name + ' ' + lname + '!'});

});

app.listen(3000, () => { console.log("Screenshot API running on port 3000"); });
