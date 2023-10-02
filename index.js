require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("DB Connected!"))
.catch(err => {
  console.log(err);
})

const port = process.env.PORT || 3000;

// Model
const schema = new mongoose.Schema({
  original: { type: String, required: true },
  short: { type: Number, required: true },
});
const Url = mongoose.model("Url", schema);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint

let i = 0;

app.post("/api/shorturl", async (req, res) => {
  const bodyUrl = req.body.url;
  let urlRegex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/
  );

  if (!bodyUrl.match(urlRegex)) {
    return res.json({ error: "Invalid URL" });
  }

  const urlCount = await Url.countDocuments();
  const newUrl = new Url({
    original: bodyUrl,
    short: urlCount + 1,
  });

  await newUrl.save();

  return res.json({
    original_url: newUrl.original,
    short_url: newUrl.short,
  });
});

app.get("/api/shorturl/:input", async (req, res) => {
  const input = parseInt(req.params.input);

  const url = await Url.findOne({ short: input });

  if (url) {
    return res.redirect(url.original);
  } else {
    return res.send("Link not found");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
