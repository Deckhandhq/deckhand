#!/usr/bin/env bun
// Launches the API and the frontend in the same parent process, with minimal supervision.
let shuttingDown = false;

const children = [
  {
    name: "api",
    cmd: ["bun", "run", "start"],
    cwd: "/app/apps/api",
    env: { ...process.env, PORT: process.env.API_PORT ?? "3000", HOST: "0.0.0.0" },
  },
  {
    name: "web",
    cmd: ["bun", "./build"],
    cwd: "/app/apps/web",
    env: { ...process.env, PORT: process.env.WEB_PORT ?? "3001", HOST: "0.0.0.0" },
  },
];

async function shutdown(code: number): Promise<never> {
  if (shuttingDown) process.exit(code);
  shuttingDown = true;
  for (const p of procs) { try { p.kill("SIGTERM"); } catch {} }
  const timeout = setTimeout(() => {
    for (const p of procs) { try { p.kill("SIGKILL"); } catch {} }
  }, 5000);
  await Promise.allSettled(procs.map((p) => p.exited));
  clearTimeout(timeout);
  process.exit(code);
}

const procs = children.map((c) =>
  Bun.spawn(c.cmd, {
    cwd: c.cwd,
    env: c.env,
    stdout: "inherit",
    stderr: "inherit",
    onExit: (_p, code, signal) => {
      if (shuttingDown) return;
      console.error(`[start-all] ${c.name} exited (code=${code}, signal=${signal})`);
      void shutdown(code ?? 1);
    },
  }),
);

process.on("SIGTERM", () => void shutdown(0));
process.on("SIGINT", () => void shutdown(0));

await Promise.allSettled(procs.map((p) => p.exited));
