import { route } from '../_lib/http.js';

export default route({
  GET: (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      version: '1.0.0',
    });
  },
});
