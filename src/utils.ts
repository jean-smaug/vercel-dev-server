import path from "node:path";
import { IncomingMessage, ServerResponse } from "node:http";
import { VercelResponse } from "@vercel/node";
import glob from "glob";

/**
 * Retrieve all files in api folder
 * Order them from more to less specific
 *
 * @example
 * await getApiPaths()
 * ["/api/foo", "/api/[userId]/posts"]
 */
export async function getApiPaths(): Promise<string[]> {
  const paths = await glob("**/api/**/*.{js,ts}", {
    realpath: true,
  });

  const filteredPaths = paths.filter((currentPath) => {
    return !path.basename(currentPath).startsWith("_");
  });

  const finalPaths: string[] = [];

  for (const path of filteredPaths) {
    if (path.endsWith("/index.ts") || path.endsWith("/index.js")) {
      finalPaths.push(path.replace(/\/index.[jt]s$/, ""));
    }

    finalPaths.push(path);
  }

  return finalPaths.sort((a, b) => (a < b ? 1 : -1));
}

/**
 * Return the JSON body of an HTTP call
 * @param request
 */
export async function retrieveBody(request: IncomingMessage): Promise<object> {
  let body = "";

  request.on("data", (chunk) => {
    body += chunk;
  });

  return new Promise((resolve) => {
    request.on("end", () => {
      if (body) {
        return resolve(JSON.parse(body));
      }

      resolve({});
    });
  });
}

/**
 * Create a vercel like response object
 * @param response A Node.js basic http Server Response
 */
export function enhanceResponse(response: ServerResponse): VercelResponse {
  const enhancedResponse = Object.assign(response, {
    send: (body: string) => {
      if (typeof body === "object") {
        throw new TypeError("[body] can't be an object, use `.json()` instead");
      }

      if (typeof body === "string") {
        response.write(body);
      } else {
        response.write(`${body}`);
      }

      response.end();

      return enhancedResponse;
    },
    json: (jsonBody: object) => {
      if (typeof jsonBody !== "object") {
        throw new TypeError("[jsonBody] must be an object");
      }

      response.write(JSON.stringify(jsonBody));
      response.end();

      return enhancedResponse;
    },
    status: (statusCode: number) => {
      response.statusCode = statusCode;

      return enhancedResponse;
    },
    redirect: () => {
      // redirect: (statusOrUrl: string | number, url?: string) => {
      // throw new Error("redirect method not supported");

      return enhancedResponse;
    },
  });

  return enhancedResponse;
}
