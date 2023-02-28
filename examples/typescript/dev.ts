import { createVercelServer } from "vercel-dev-server";

createVercelServer().then((server) => {
  const PORT = 8080;
  const HOST = "127.0.0.1";

  // `server` is a basic http server.
  // It can takes all params mentionned in Node.js documentation
  // https://nodejs.org/api/http.html#serverlisten
  // https://nodejs.org/api/net.html#serverlistenoptions-callback
  server.listen({
    host: HOST,
    port: PORT,
  });

  console.log(`🏃‍♂️ Server started on http://${HOST}:${PORT}`);
});
