import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Types
export type SignUpCredentials = {
  email: string;
  password: string;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role?: string;
};

// Helper: Cleanup local/session storage
const cleanupAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export async function signUp(credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {}

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.user) {
      return { user: null, error: error?.message || "Failed to create user" };
    }

    // Insert into admin_users
    await supabase
      .from('admin_users')
      .insert([{ user_id: data.user.id, email: data.user.email, role: 'admin' }])
      .catch((err) => console.error("Insert admin error:", err));

    return {
      user: { id: data.user.id, email: data.user.email || '', role: 'admin' },
      error: null,
    };
  } catch (err) {
    return { user: null, error: "Unexpected error during sign up" };
  }
}

export async function signIn(credentials: SignInCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {}

    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error || !data.user) {
      return { user: null, error: error?.message || "Failed to sign in" };
    }

    // Get role
    let role = 'user';
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.user.id)
      .single();

    if (adminUser?.role) role = adminUser.role;

    toast({ title: "Authentication successful", description: "Redirecting to admin panel..." });

    return {
      user: { id: data.user.id, email: data.user.email || '', role },
      error: null,
    };
  } catch {
    return { user: null, error: "Unexpected error during sign in" };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    cleanupAuthState();
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) return { error: error.message };
    window.location.href = '/';
    return { error: null };
  } catch {
    return { error: "Unexpected error during sign out" };
  }
}

export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      return { user: null, error: error?.message || null };
    }

    let role = 'user';
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.session.user.id)
      .single();

    if (adminUser?.role) role = adminUser.role;

    return {
      user: { id: data.session.user.id, email: data.session.user.email || '', role },
      error: null,
    };
  } catch {
    return { user: null, error: "Unexpected error getting user" };
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();

    return data?.role === 'admin';
  } catch {
    return false;
  }
}
