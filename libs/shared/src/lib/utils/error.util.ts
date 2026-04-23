export function parseFirebaseError(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
  };
  return messages[code] ?? 'An unexpected error occurred.';
}

export function parseHttpError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    if (typeof e['message'] === 'string') return e['message'];
    if (typeof e['code'] === 'string') return parseFirebaseError(e['code']);
  }
  return 'An unexpected error occurred.';
}
