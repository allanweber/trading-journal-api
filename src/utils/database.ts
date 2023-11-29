export function getDbName(email: string) {
  return email.replace(/[\W_]+/g, '_');
}
