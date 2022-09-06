const fs = require("fs");
const multer = require("multer");
const express = require("express");
const app = express();
const path = require("path");
const { parse } = require("csv-parse");
const PORT = 3000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

app.use(express.json());

const upload = multer({ storage: storage });

app.post("/", upload.single("uploaded_file"), (req, res) => {
  res.send(`${req.file.filename} File saved`);
});

app.get("/readfile", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      res.send(err.message);
    } else {
      res.send(JSON.stringify(files));
    }
  });
});

let arr = [];

app.post("/parsefile", (req, res) => {
  const { name } = req.body;
  const dir = path.join("uploads", name);
  if (fs.existsSync(dir)) {
    fs.createReadStream(dir).pipe(
      parse({
        comment: "#",
        columns: true,
      })
        .on("data", (data) => {
          arr.push(data);
        })
        .on("error", (err) => {
          res.send(err);
        })
        .on("end", () => {
          res.send(arr.splice(0, 100));
        })
    );
  } else {
    res.send("File doesn't exist.");
  }
});

app.listen(PORT, () => {
  console.log(`Server started running on port ${PORT}`);
});
