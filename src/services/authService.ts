
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
    console.log("Starting sign up process for:", credentials.email);
    
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {}

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin-dashboard`
      }
    });

    console.log("Sign up response:", { data, error });

    if (error || !data.user) {
      console.error("Sign up failed:", error);
      return { user: null, error: error?.message || "Failed to create user" };
    }

    // Insert into admin_users table
    try {
      console.log("Creating admin user record for:", data.user.id);
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([{ 
          user_id: data.user.id, 
          email: data.user.email, 
          role: 'admin' 
        }]);
      
      if (insertError) {
        console.error("Insert admin error:", insertError);
      } else {
        console.log("Admin user record created successfully");
      }
    } catch (err) {
      console.error("Insert admin error:", err);
    }

    return {
      user: { id: data.user.id, email: data.user.email || '', role: 'admin' },
      error: null,
    };
  } catch (err) {
    console.error("Sign up error:", err);
    return { user: null, error: "Unexpected error during sign up" };
  }
}

export async function signIn(credentials: SignInCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    console.log("Starting sign in process for:", credentials.email);
    
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {}

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    console.log("Sign in response:", { data, error });

    if (error || !data.user) {
      console.error("Sign in failed:", error);
      return { user: null, error: error?.message || "Failed to sign in" };
    }

    console.log("User signed in successfully, checking admin role...");

    // Get role from admin_users table
    let role = 'user';
    try {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      console.log("Admin user query result:", { adminUser, adminError });

      if (adminUser && adminUser.role) {
        role = adminUser.role;
        console.log("User role found:", role);
      } else {
        console.log("No admin role found for user, creating admin record...");
        // Create admin record if it doesn't exist
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert([{ 
            user_id: data.user.id, 
            email: data.user.email, 
            role: 'admin' 
          }]);
        
        if (!insertError) {
          role = 'admin';
          console.log("Admin record created successfully");
        }
      }
    } catch (err) {
      console.error("Error checking/creating admin role:", err);
    }

    return {
      user: { id: data.user.id, email: data.user.email || '', role },
      error: null,
    };
  } catch (err) {
    console.error("Unexpected error during sign in:", err);
    return { user: null, error: "Unexpected error during sign in" };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    console.log("Signing out user...");
    cleanupAuthState();
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      console.error("Sign out error:", error);
      return { error: error.message };
    }
    console.log("User signed out successfully");
    window.location.href = '/';
    return { error: null };
  } catch (err) {
    console.error("Unexpected sign out error:", err);
    return { error: "Unexpected error during sign out" };
  }
}

export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    console.log("Getting current user session...");
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session?.user) {
      console.log("No active session found");
      return { user: null, error: error?.message || null };
    }

    console.log("Session found, checking admin role...");
    let role = 'user';
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.session.user.id)
      .maybeSingle();

    if (adminUser && adminUser.role) {
      role = adminUser.role;
      console.log("Current user role:", role);
    }

    return {
      user: { id: data.session.user.id, email: data.session.user.email || '', role },
      error: null,
    };
  } catch (err) {
    console.error("Error getting current user:", err);
    return { user: null, error: "Unexpected error getting user" };
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    return data?.role === 'admin';
  } catch {
    return false;
  }
}
