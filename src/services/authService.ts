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
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const supabaseAuth = {
  async signUp(credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {});

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error || !data?.user) {
        return { user: null, error: error?.message || "Failed to create user" };
      }

      const user = data.user;

      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([{ user_id: user.id, email: user.email, role: 'admin' }]);

      if (insertError) {
        console.error("Insert admin error:", insertError.message);
      }

      return {
        user: { id: user.id, email: user.email || '', role: 'admin' },
        error: null,
      };
    } catch (err: any) {
      console.error("Sign up error:", err.message);
      return { user: null, error: "Unexpected error during sign up" };
    }
  },

  async signIn(credentials: SignInCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {});

      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error || !data?.user) {
        return { user: null, error: error?.message || "Failed to sign in" };
      }

      const user = data.user;
      let role = 'user';

      const { data: adminUser, error: roleError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) console.warn("Role fetch error:", roleError.message);
      if (adminUser?.role) role = adminUser.role;

      toast({ title: "Authentication successful", description: "Redirecting to admin panel..." });

      return {
        user: { id: user.id, email: user.email || '', role },
        error: null,
      };
    } catch (err: any) {
      console.error("Sign in error:", err.message);
      return { user: null, error: "Unexpected error during sign in" };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      cleanupAuthState();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) return { error: error.message };

      window.location.href = '/';
      return { error: null };
    } catch (err: any) {
      console.error("Sign out error:", err.message);
      return { error: "Unexpected error during sign out" };
    }
  },

  async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        return { user: null, error: error?.message || "Session not found" };
      }

      const user = data.session.user;
      let role = 'user';

      const { data: adminUser, error: roleError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) console.warn("Role fetch error:", roleError.message);
      if (adminUser?.role) role = adminUser.role;

      return {
        user: { id: user.id, email: user.email || '', role },
        error: null,
      };
    } catch (err: any) {
      console.error("Get user error:", err.message);
      return { user: null, error: "Unexpected error getting user" };
    }
  },

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn("isAdmin error:", error.message);
        return false;
      }

      return data?.role === 'admin';
    } catch (err: any) {
      console.error("isAdmin catch error:", err.message);
      return false;
    }
  },
};
