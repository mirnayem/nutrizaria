import { brotliCompressSync, gzipSync } from "node:zlib";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response, ctx) => {
    if (typeof response.body !== "string") return;

    const headers = response.headers || {};
    const contentType = String(headers["content-type"] || "");
    if (!/text\/html/.test(contentType)) return;

    const acceptEncoding =
      String(ctx.event.node.req.headers["accept-encoding"] || "").toLowerCase() ||
      "";

    let encoding: string | null = null;
    let body: Buffer | null = null;

    if (/\bbr\b/.test(acceptEncoding)) {
      body = brotliCompressSync(Buffer.from(response.body));
      encoding = "br";
    } else if (/\bgzip\b/.test(acceptEncoding)) {
      body = gzipSync(Buffer.from(response.body), { level: 6 });
      encoding = "gzip";
    }

    if (encoding && body) {
      response.body = body;
      response.headers = {
        ...headers,
        "content-encoding": encoding,
        "content-length": String(body.length),
        vary: "accept-encoding",
      };
    }
  });
});
