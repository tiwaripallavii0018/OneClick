import express from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.AWS_S3_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const app = express();

function getContentType(path: string) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

app.use(async (req, res) => {
  try {
    const id = req.hostname.split(".")[0];

    let filePath = req.path;
    if (filePath === "/") filePath = "/index.html";

    const key = `dist/${id}${filePath}`; // 🔥 FIXED
    console.log("S3 Key:", key);

    const content = await s3.send(
      new GetObjectCommand({
        Bucket: "vercel-bucket",
        Key: key,
      })
    );

    if (!content.Body) {
      return res.status(404).send("No file");
    }

    res.setHeader("Content-Type", getContentType(filePath));

    (content.Body as Readable).pipe(res);

  } catch (err) {
    console.log("Fallback to index.html");

    try {
      const id = req.hostname.split(".")[0];

      const fallback = await s3.send(
        new GetObjectCommand({
          Bucket: "vercel-bucket",
          Key: `dist/${id}/index.html`,
        })
      );

      res.setHeader("Content-Type", "text/html");
      (fallback.Body as Readable).pipe(res);

    } catch {
      res.status(404).send("Not Found");
    }
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});