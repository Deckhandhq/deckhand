import { app } from "./app";
import { env } from "./env";

app.listen(env.port);

console.log(`Deckhand API listening on http://localhost:${app.server?.port}`);
