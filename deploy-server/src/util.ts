import { exec, spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
export function buildProject(id: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return new Promise((resolve) => {
    const child = exec(
      `cd ${path.join(__dirname, `cloned-repo/${id}`)} && npm install && npm run build`,
    );
    child.stdout?.on("data", (data) => {
      console.log("stdout:", data);
    });
    child.stderr?.on("data", (data) => {
      console.log("stderr:", data);
    });
    child.on("close", (code) => {
      resolve("");
    });
  });
}
