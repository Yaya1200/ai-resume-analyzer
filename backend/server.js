import express from "express";
import cors from "cors";
import mammoth from "mammoth";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const keywords = [
  "JavaScript", "React", "Node.js", "Python", "SQL",
  "Communication", "Leadership", "Teamwork",
  "Problem Solving", "CSS", "HTML"
];

function analyzeResume(text) {
  let score = 0;
  let foundKeywords = [];

  keywords.forEach((word) => {
    if (text.toLowerCase().includes(word.toLowerCase())) {
      score += 10;
      foundKeywords.push(word);
    }
  });

  const suggestions = [];

  if (score < 50) suggestions.push("Add more technical skills.");
  if (!text.toLowerCase().includes("experience")) {
    suggestions.push("Include experience section.");
  }
  if (!text.toLowerCase().includes("education")) {
    suggestions.push("Include education section.");
  }

  return {
    score: Math.min(score, 100),
    foundKeywords,
    missingKeywords: keywords.filter(k => !foundKeywords.includes(k)),
    suggestions
  };
}

app.post("/upload", async (req, res) => {
  try {
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = Buffer.from(file, "base64");

    const result = await mammoth.extractRawText({ buffer });

    const analysis = analyzeResume(result.value);

    res.json(analysis);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing file" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
