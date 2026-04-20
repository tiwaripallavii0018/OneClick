import { createClient } from "redis";
import { downloadS3bucket, copyFinalDist } from "./aws.js";
import { buildProject } from "./utils.js";
const subscriber = createClient();
subscriber.connect();
const publisher = createClient();
publisher.connect();
async function main() {
  while (1) {
    const response = await subscriber.brPop("build-queue", 0);
    if (!response) continue;
    const id = response.element;
    await downloadS3bucket(`cloned-repo/${id}`);
    await buildProject(id);
    await copyFinalDist(id);
    publisher.hSet("status", id, "deployed");
  }
}
main();
