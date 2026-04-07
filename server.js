const express = require("express");
const multer = require("multer");
const path = require("path");
const cv = require("opencv4nodejs");
const fs = require("fs");

const app = express();

// Serve public folder
app.use(express.static("public"));
app.use("/stitched", express.static("stitched"));

// Multer settings
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.array("images"), async (req, res) => {
  console.log("Received images:", req.files.length);

  try {
    // Load all uploaded images
    const imgs = req.files.map(f => cv.imread(f.path));

    // Stitch them using OpenCV Stitcher
    const stitcher = new cv.Stitcher(cv.Stitcher_SCANS);
    const { status, panorama } = stitcher.stitch(imgs);

    if (status !== cv.Stitcher_OK) {
      console.log("Stitching failed:", status);
      return res.send("Stitching failed");
    }

    // Save stitched result
    if (!fs.existsSync("stitched")) fs.mkdirSync("stitched");
    cv.imwrite("stitched/stitched.jpg", panorama);

    console.log("Stitched image saved.");

    // Redirect back to the webpage to display stitched image
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while stitching images.");
  }
});

// Start server
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});
