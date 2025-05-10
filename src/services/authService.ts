
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

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
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

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
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

    const authUser: AuthUser = {
      id: data.session.user.id,
      email: data.session.user.email || '',
    };

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: "An unexpected error occurred while getting current user" };
  }
};
