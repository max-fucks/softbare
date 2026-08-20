export function isAdminEmail(email: string | null | undefined) {
  const admin = process.env.ADMIN_EMAIL || "anshmax1212@gmail.com";
  return Boolean(email) && email === admin;
}
