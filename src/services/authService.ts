
import { supabase } from "@/integrations/supabase/client";

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

// Sign up a new user
export const signUp = async (credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "Failed to create user" };
    }

    // Create a record in the admin_users table
    const { error: profileError } = await supabase
      .from('admin_users')
      .insert([
        { 
          user_id: data.user.id,
          email: data.user.email,
          role: 'admin'
        }
      ]);

    if (profileError) {
      console.error("Error creating admin user profile:", profileError);
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: 'admin'
    };

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: "An unexpected error occurred during sign up" };
  }
};

// Sign in an existing user
export const signIn = async (credentials: SignInCredentials): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "Failed to sign in" };
    }

    // Fetch the admin profile to get the role
    const { data: adminUser, error: profileError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching admin user profile:", profileError);
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: adminUser?.role || 'user'
    };

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: "An unexpected error occurred during sign in" };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return { error: "An unexpected error occurred during sign out" };
  }
};

// Get the current user session
export const getCurrentUser = async (): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.session || !data.session.user) {
      return { user: null, error: null };
    }

    // Fetch the admin profile to get the role
    const { data: adminUser, error: profileError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching admin user profile:", profileError);
    }

    const authUser: AuthUser = {
      id: data.session.user.id,
      email: data.session.user.email || '',
      role: adminUser?.role || 'user'
    };

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: "An unexpected error occurred while getting current user" };
  }
};

// Check if a user is an admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.role === 'admin';
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
