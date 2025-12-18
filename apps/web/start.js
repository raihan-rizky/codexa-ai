import { spawn } from "child_process";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

// Get port from environment or default to 3000
const port = process.env.PORT || 3000;

console.log(`Starting web server on port ${port}...`);

const cmd = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(cmd, ["serve", "dist", "-l", port], {
  stdio: "inherit",
  shell: true,
});

child.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

child.on("close", (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});
