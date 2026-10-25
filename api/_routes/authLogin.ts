import { clientIp, HttpError, route } from '../_lib/http.js';
import { findUserForLogin, setSession, verifyPassword } from '../_lib/auth.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { loginSchema } from '../_lib/schemas.js';
import { serializeUser } from '../_lib/serialize.js';

export default route({
  POST: async (req, res) => {
    await rateLimit(
      `login:${clientIp(req)}`,
      5,
      15 * 60,
      'Too many login attempts, please try again later'
    );

    const { email, password } = loginSchema.parse(req.body);

    const user = await findUserForLogin(email);
    // Same response whether the account is missing or the password is wrong, so the
    // endpoint can't be used to enumerate agents.
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new HttpError(401, 'Invalid credentials');
    }

    await setSession(res, user.id);
    res.status(200).json({ user: serializeUser(user) });
  },
});
