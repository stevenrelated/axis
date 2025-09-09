import 'server-only';
import { upsertAuthUser } from '@/lib/db/queries';

export async function ensureUserFromAuth(args: {
  id: string;
  email: string | null;
}) {
  const { id, email } = args;
  await upsertAuthUser(id, email);
}
