import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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

// Helper function to clean up auth state and prevent auth limbo
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Sign up a new user
export const signUp = async (credentials: SignUpCredentials): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    // Clean up any existing auth state
    cleanupAuthState();
    
    // Try to sign out globally first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors here and continue
    }
    
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
    try {
      // Using the correct table from the database
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
    } catch (err) {
      console.error("Error inserting admin user:", err);
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
    // Clean up any existing auth state
    cleanupAuthState();
    
    // Try to sign out globally first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors here and continue
    }
    
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
    let role = 'user';
    try {
      // Using the correct table from the database
      const { data: adminUser, error: profileError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching admin user profile:", profileError);
      }

      if (adminUser) {
        role = adminUser.role;
      }
    } catch (err) {
      console.error("Error querying admin_users:", err);
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: role
    };
    
    // Force refresh to ensure clean state with new auth tokens
    setTimeout(() => {
      toast({
        title: "Authentication successful",
        description: "Redirecting to admin panel...",
      });
    }, 0);

    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: "An unexpected error occurred during sign in" };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    // Clean up first
    cleanupAuthState();
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      return { error: error.message };
    }
    
    // Force page reload for clean state
    window.location.href = '/';
    
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
    let role = 'user';
    try {
      // Using the correct table from the database
      const { data: adminUser, error: profileError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching admin user profile:", profileError);
      }

      if (adminUser) {
        role = adminUser.role;
      }
    } catch (err) {
      console.error("Error querying admin_users:", err);
    }

    const authUser: AuthUser = {
      id: data.session.user.id,
      email: data.session.user.email || '',
      role: role
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
import { auth, db } from "@/integrations/firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function signUp(
  email: string,
  password: string,
  profile: { name: string; phoneNumber: string; address: { city: string; state: string; country: string } }
) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), profile);
  return user;
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string) {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
}
