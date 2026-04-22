
import express, { response } from "express"
import cors from "cors"
import path from "path"
const app = express()
import { simpleGit } from "simple-git"
import { generate } from "./utils.js"
import { getAllFiles } from "./file.js"
import { fileURLToPath } from "url";
import { uploadFile } from "./aws.js"
import { createClient } from "redis"
const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();


app.use(cors())
app.use(express.json())
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  console.log(repoUrl);
  const id = generate()
  await simpleGit().clone(repoUrl, path.join(__dirname, `cloned-repo/${id}`))
  const files = getAllFiles(path.join(__dirname, `cloned-repo/${id}`))
  files.forEach(async (file: string) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  })
  await publisher.lPush("build-queue", id)
  publisher.hSet("status", id, "uploaded");
  res.json({ id})
})
app.listen(3000, () => {
    console.log("Server is running on port 3000")
  })