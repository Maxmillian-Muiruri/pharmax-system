export interface AuthUser {
  userId?: string;
  username?: string;
  fullName?: string;
  email: string;
  loggedIn?: boolean;
  loginTime?: string;
  token?: string;
  profilePicture?: string;
}

export function getAuthUser(): AuthUser | null {
  try {
    const user = localStorage.getItem('pharmacie_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing auth user:', error);
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem('pharmacie_user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
}

export function clearAuthUser(): void {
  localStorage.removeItem('pharmacie_user');
  window.dispatchEvent(new Event('auth-change'));
}

export function isAuthenticated(): boolean {
  const user = getAuthUser();
  return !!(user?.loggedIn && user?.email);
}

export function getAuthToken(): string | null {
  const user = getAuthUser();
  return user?.token || null;
}
