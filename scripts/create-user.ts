import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { supabase } from '../api/_lib/supabase.js';
import { hashPassword } from '../api/_lib/auth.js';

/**
 * Creates a login account.
 *
 *   pnpm create-user <email> "<Full Name>" [agent|admin] [phone]
 *
 * The generated password is written to .credentials/ (gitignored) rather than printed,
 * so it does not end up in shell history or terminal scrollback. Treat it as a
 * first-login secret: sign in and change it, then delete the file.
 *
 * `admin` is the elevated role — it reaches every agent's listings, customers, and
 * inquiries, and is hidden from the public Meet Our Team page.
 */
const [email, name, role = 'agent', phone = '929-488-3666'] = process.argv.slice(2);

if (!email || !name) {
  console.error('Usage: pnpm create-user <email> "<Full Name>" [agent|admin] [phone]');
  process.exit(1);
}

if (role !== 'agent' && role !== 'admin') {
  console.error(`Invalid role "${role}". The schema allows only 'agent' or 'admin'.`);
  process.exit(1);
}

/** url-safe, ~180 bits. */
function generatePassword(): string {
  return randomBytes(24).toString('base64url');
}

async function main() {
  const normalisedEmail = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalisedEmail)
    .maybeSingle();

  if (existing) {
    console.error(`A user with email ${normalisedEmail} already exists (id ${existing.id}).`);
    console.error('Refusing to overwrite. Delete it first if you meant to recreate it.');
    process.exit(1);
  }

  const password = generatePassword();
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: normalisedEmail,
      password_hash: await hashPassword(password),
      name,
      phone,
      role,
    })
    .select('id, email, name, role')
    .single();

  if (error) throw error;

  mkdirSync('.credentials', { recursive: true });
  const file = `.credentials/${normalisedEmail}.txt`;
  writeFileSync(
    file,
    [
      `email:    ${data.email}`,
      `password: ${password}`,
      `role:     ${data.role}`,
      `created:  ${new Date().toISOString()}`,
      '',
      'Change this password after first login, then delete this file.',
      '',
    ].join('\n'),
    { mode: 0o600 }
  );

  console.log(`Created ${data.name} <${data.email}> with role '${data.role}'.`);
  console.log(`Password written to ${file} (gitignored, mode 600).`);
}

main().catch((error) => {
  console.error('Failed to create user:', error);
  process.exit(1);
});
