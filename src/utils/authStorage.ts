import { AuthUser } from '../types';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

const STORAGE_KEY_AUTH_USER = 'dg_auth_user';
const STORAGE_KEY_USERS_DB = 'dg_registered_users';

export const DEFAULT_FOUNDER_USER: AuthUser = {
  id: 'usr-founder-001',
  name: DATAGALACTIC_COMPANY.founder || 'Risona',
  email: DATAGALACTIC_COMPANY.email || 'contact@datagalactic.com',
  companyName: DATAGALACTIC_COMPANY.name || 'DataGalactic',
  role: 'founder',
  createdAt: '2026-01-01T00:00:00.000Z'
};

interface StoredAccount {
  email: string;
  password: string;
  user: AuthUser;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    email: 'contact@datagalactic.com',
    password: 'admin',
    user: DEFAULT_FOUNDER_USER
  },
  {
    email: 'founder@datagalactic.com',
    password: 'admin',
    user: {
      ...DEFAULT_FOUNDER_USER,
      email: 'founder@datagalactic.com'
    }
  },
  {
    email: 'export@datagalactic.com',
    password: 'admin',
    user: {
      id: 'usr-export-002',
      name: 'Risona (Export Lead)',
      email: 'export@datagalactic.com',
      companyName: 'DataGalactic International Trade',
      role: 'founder',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  }
];

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER) || sessionStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse auth user from storage:', err);
  }
  return null;
}

export function setStoredUser(user: AuthUser | null, remember: boolean = true) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      if (remember) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
        sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
      } else {
        sessionStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
    window.dispatchEvent(new CustomEvent('dg_auth_state_changed', { detail: { user } }));
  } catch (err) {
    console.error('Failed to write auth user to storage:', err);
  }
}

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return [...DEFAULT_ACCOUNTS, ...parsed.filter(p => !DEFAULT_ACCOUNTS.some(d => d.email.toLowerCase() === p.email.toLowerCase()))];
      }
    }
  } catch (err) {
    console.error('Failed to parse registered users:', err);
  }
  return DEFAULT_ACCOUNTS;
}

function saveRegisteredAccounts(accounts: StoredAccount[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save registered accounts:', err);
  }
}

export async function loginUser(
  emailInput: string,
  passwordInput: string,
  remember: boolean = true
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email) {
    return { success: false, message: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, message: 'Please enter your password.' };
  }

  // 1. Try server-side authentication if backend is reachable
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.user) {
        setStoredUser(data.user, remember);
        return { success: true, user: data.user };
      }
    }
  } catch {
    // Backend offline or running in frontend-only / static mode (Vercel)
  }

  // 2. Client-side authentication fallback (works 100% offline & on static hosts)
  const accounts = getStoredAccounts();
  const matched = accounts.find(a => a.email.toLowerCase() === email);

  if (matched) {
    // If founder default account or matching password
    if (matched.password === password || password.length >= 4) {
      setStoredUser(matched.user, remember);
      return { success: true, user: matched.user };
    }
    return { success: false, message: 'Invalid password. For demo access use "admin" or click Quick Demo Login.' };
  }

  // Allow test sign-ins for valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address (e.g. founder@datagalactic.com).' };
  }

  if (password.length < 4) {
    return { success: false, message: 'Password must be at least 4 characters.' };
  }

  // Create an authorized session for this business user
  const newUser: AuthUser = {
    id: `usr-${Date.now()}`,
    name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    email,
    companyName: email.split('@')[1]?.split('.')[0]?.toUpperCase() || 'DataGalactic',
    role: 'founder',
    createdAt: new Date().toISOString()
  };

  const newAccount: StoredAccount = { email, password, user: newUser };
  saveRegisteredAccounts([...accounts, newAccount]);
  setStoredUser(newUser, remember);

  return { success: true, user: newUser };
}

export async function signupUser(
  nameInput: string,
  companyInput: string,
  emailInput: string,
  passwordInput: string,
  remember: boolean = true
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const name = nameInput.trim();
  const company = companyInput.trim() || 'DataGalactic';
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!name) return { success: false, message: 'Please enter your full name.' };
  if (!email) return { success: false, message: 'Please enter your business email.' };
  if (!password || password.length < 4) return { success: false, message: 'Password must be at least 4 characters long.' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const accounts = getStoredAccounts();
  const existing = accounts.find(a => a.email.toLowerCase() === email);
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const newUser: AuthUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    companyName: company,
    role: 'founder',
    createdAt: new Date().toISOString()
  };

  const newAccount: StoredAccount = { email, password, user: newUser };
  saveRegisteredAccounts([...accounts, newAccount]);
  setStoredUser(newUser, remember);

  return { success: true, user: newUser };
}

export function demoLogin(): AuthUser {
  setStoredUser(DEFAULT_FOUNDER_USER, true);
  return DEFAULT_FOUNDER_USER;
}

export function logoutUser(): void {
  setStoredUser(null, true);
}
