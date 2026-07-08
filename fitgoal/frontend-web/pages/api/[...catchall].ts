import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../backend-src/index';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false, // Let Express handle its own body parsing
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>((resolve, reject) => {
    // Pass the request directly to the Express application
    app(req as any, res as any, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
