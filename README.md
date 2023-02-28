# Vercel dev server

Based on discussions on Vercel repository, there is no way to use `vercel dev` [command inside a monorepo](https://github.com/vercel/vercel/discussions/5294#discussioncomment-269338).

This package aims to emulate the dev server of vercel in order to make it usable with multiple vercel project inside the same repository.

## Setup

You know the song, install the dependency with your favourite package manager.

```bash
pnpm add -D vercel-dev-server
yarn add -D vercel-dev-server
npm install -D vercel-dev-server
```

```ts
// dev.js

const { createVercelServer } = require("@packages/vercel-dev-server");

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
```

After that you can create a script in your package.json in order to launch it with a short command line

```bash
pnpm add -D nodemon
```

```json
{
  "scripts": {
    "dev": "nodemon dev.js"
  }
}
```
