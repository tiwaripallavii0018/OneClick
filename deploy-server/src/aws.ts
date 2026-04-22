import path from "path";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import { Readable } from "stream";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export async function downloadS3bucket(prefix: string) {
  const command = new ListObjectsV2Command({
    Bucket: "vercel-bucket",
    Prefix: prefix,
  });
  const allFiles = await s3.send(command);
  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        console.log(finalOutputPath);
        const outputFile = fs.createWriteStream(finalOutputPath);
        console.log(outputFile);
        const dirName = path.dirname(finalOutputPath);
        console.log(dirName);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        console.log(dirName);
        const getObjectCommand = await s3.send(
          new GetObjectCommand({
            Bucket: "vercel-bucket",
            Key: Key,
          }),
        );
        const objectData = getObjectCommand.Body as Readable;
        objectData.pipe(outputFile).on("finish", () => {
          resolve("");
        });
      });
    }) || [];
  console.log("awaiting");
  await Promise.all(allPromises?.filter((x) => x !== undefined));
}
export async function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `cloned-repo/${id}/dist`);

  const allFiles = getAllFiles(folderPath);

  await Promise.all(
    allFiles.map((file) => {
      const key = `dist/${id}/` + file.slice(folderPath.length + 1);
      return uploadFile(key, file);
    }),
  );
}
export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];
  console.log("DIST PATH:", folderPath);
  console.log("EXISTS:", fs.existsSync(folderPath));
  const allFiles = fs.readdirSync(folderPath);
  allFiles.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      response = response.concat(getAllFiles(filePath));
    } else {
      response.push(filePath);
    }
  });
  return response;
};
const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);

  const command = new PutObjectCommand({
    Bucket: "vercel-bucket",
    Key: fileName,
    Body: fileContent,
  });

  const response = await s3.send(command);
  console.log(response);
};
