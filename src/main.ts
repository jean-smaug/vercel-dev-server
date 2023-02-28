import http from "node:http";
import url from "node:url";
import { VercelRequest, VercelRequestQuery } from "@vercel/node";
import { match } from "path-to-regexp";
// NOTE: .js extension is here to allow resolution of module in build folder
import { enhanceResponse, getApiPaths, retrieveBody } from "./utils.js";

export async function createVercelServer() {
  const apiFilePaths = await getApiPaths();

  const routeApiPaths = apiFilePaths.map((path) => {
    return path
      .replace(process.cwd(), "")
      .replace(".js", "")
      .replace(".ts", "");
  });

  const matchRouteApiPaths = routeApiPaths.map((path) => {
    // eslint-disable-next-line unicorn/better-regex
    return match(path.replace(/\[(.+)\]/g, ":$1"), {
      decode: decodeURIComponent,
    });
  });

  return http.createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");

    const enhancedResponse = enhanceResponse(response);

    const parsedUrl = url.parse(request.url as string, true);

    const resultsRoutesMatch = matchRouteApiPaths.map((matchRouteApiPath) => {
      return matchRouteApiPath(parsedUrl.pathname as string);
    });

    const matchedIndex = resultsRoutesMatch.findIndex((item) => !!item);

    const matchedRoute = resultsRoutesMatch[matchedIndex];

    if (!matchedRoute) {
      return enhancedResponse.send(
        `"${
          request.url
        }" didn't match.\n\nAllowed paths are :\n${routeApiPaths.join("\n")}`
      );
    }

    const body = await retrieveBody(request);

    const enhancedRequest: VercelRequest = Object.assign(request, {
      cookies: {},
      body,
      query: {
        ...matchedRoute.params,
        ...parsedUrl.query,
      } as VercelRequestQuery,
    });

    const absoluteFilePath = apiFilePaths[matchedIndex];
    const { default: fn } = await import(absoluteFilePath);

    if (!fn) {
      enhancedResponse.send(`Couldn't find file : ${absoluteFilePath}`);
    }

    await fn(enhancedRequest, enhancedResponse);
  });
}
