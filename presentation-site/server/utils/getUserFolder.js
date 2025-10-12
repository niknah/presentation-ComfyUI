export default function(session) {
  if (session?.user?.email && session?.type) {
    return `${fixTypeName(session.type)}_${session.user.email.replace(/[^a-z0-9_@.-]/gi, '')}`;
  }
  return process.env.GUEST_ACCOUNT || '';
}
