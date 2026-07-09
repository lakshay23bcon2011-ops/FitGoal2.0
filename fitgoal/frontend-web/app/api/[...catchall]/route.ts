import { NextRequest } from 'next/server';
import app from '../../../backend-src/index';
import { runExpress } from '../../../utils/expressAdapter';

const handler = (req: NextRequest) => runExpress(app, req);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as HEAD,
  handler as OPTIONS
};
