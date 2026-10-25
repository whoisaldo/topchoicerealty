import { HttpError, route } from '../_lib/http.js';
import { getUser } from '../_lib/auth.js';
import { serializeUser } from '../_lib/serialize.js';

export default route({
  GET: async (req, res) => {
    const user = await getUser(req);
    if (!user) throw new HttpError(401, 'Not authenticated');
    res.status(200).json({ user: serializeUser(user) });
  },
});
