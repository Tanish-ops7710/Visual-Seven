// ============================================
// Visual Seven — Auth Helpers
// ============================================

/**
 * Sign in with email and password
 */
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

/**
 * Sign up with email and password (first-time admin setup)
 */
async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

/**
 * Sign out the current user
 */
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/admin/login.html';
}

/**
 * Get current session
 */
async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

/**
 * Guard admin routes — redirect to login if not authenticated
 */
async function guardAdminRoute() {
    const session = await getSession();
    if (!session) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

/**
 * Check if user is already logged in (used on login page to redirect to dashboard)
 */
async function redirectIfLoggedIn() {
    const session = await getSession();
    if (session) {
        window.location.href = '/admin/dashboard.html';
    }
}
