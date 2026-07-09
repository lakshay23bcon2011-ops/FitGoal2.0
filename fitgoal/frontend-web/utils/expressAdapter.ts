import { NextRequest } from 'next/server';
import http from 'http';
import { Socket } from 'net';

export function runExpress(app: any, req: NextRequest): Promise<Response> {
  return new Promise<Response>(async (resolve, reject) => {
    // 1. Create a dummy socket
    const socket = new Socket();

    // 2. Instantiate a Node.js http.IncomingMessage
    const incomingMessage = new http.IncomingMessage(socket);

    // Set HTTP method, URL, and headers
    incomingMessage.method = req.method;
    incomingMessage.url = req.nextUrl.pathname + req.nextUrl.search;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    incomingMessage.headers = headers;

    // 3. Read body from NextRequest
    try {
      if (req.body) {
        const reader = req.body.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        const bodyBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
        incomingMessage.push(bodyBuffer);
      }
    } catch (e) {
      // Ignore body reading issues if no body exists
    }
    incomingMessage.push(null); // End the request stream

    // 4. Instantiate a Node.js http.ServerResponse
    const serverResponse = new http.ServerResponse(incomingMessage);

    let statusCode = 200;
    const responseHeaders: Record<string, string | string[]> = {};
    const bodyChunks: Buffer[] = [];

    // Override writeHead
    serverResponse.writeHead = function (status: number, messageOrHeaders?: any, headersArg?: any) {
      statusCode = status;
      const headersToUse = typeof messageOrHeaders === 'object' ? messageOrHeaders : headersArg;
      if (headersToUse) {
        Object.entries(headersToUse).forEach(([k, v]) => {
          responseHeaders[k.toLowerCase()] = v as string;
        });
      }
      return this;
    };

    // Override setHeader
    serverResponse.setHeader = function (name: string, value: string | string[]) {
      responseHeaders[name.toLowerCase()] = value;
      return this;
    };

    // Override getHeader
    serverResponse.getHeader = function (name: string) {
      return responseHeaders[name.toLowerCase()];
    };

    // Override write
    serverResponse.write = function (chunk: any) {
      if (chunk) {
        bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return true;
    };

    // Override end
    serverResponse.end = function (chunk: any) {
      if (chunk) {
        bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const bodyBuffer = Buffer.concat(bodyChunks);
      const headersInit: HeadersInit = {};
      Object.entries(responseHeaders).forEach(([k, v]) => {
        headersInit[k] = Array.isArray(v) ? v.join(', ') : String(v);
      });

      const response = new Response(bodyBuffer, {
        status: statusCode,
        headers: headersInit
      });
      resolve(response);
      return this;
    };

    // 5. Invoke Express
    app(incomingMessage, serverResponse);
  });
}
