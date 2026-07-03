// ============================================
// Visual Seven — Admin Login Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Redirect to dashboard if already logged in
    redirectIfLoggedIn();

    // Password toggle
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = togglePassword.querySelector('iconify-icon');
            icon.setAttribute('icon', type === 'password' ? 'lucide:eye' : 'lucide:eye-off');
        });
    }

    // Login form
    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Clear error
            if (errorMsg) {
                errorMsg.classList.add('hidden');
                errorMsg.textContent = '';
            }

            // Show loading
            if (submitBtn) submitBtn.disabled = true;
            if (submitText) submitText.textContent = 'Signing in...';
            if (submitSpinner) submitSpinner.classList.remove('hidden');

            try {
                await signIn(email, password);
                // Redirect to dashboard
                window.location.href = '/admin/dashboard.html';
            } catch (err) {
                console.error('Login error:', err);

                // Show error message
                if (errorMsg) {
                    errorMsg.textContent = err.message === 'Invalid login credentials'
                        ? 'Invalid email or password. Please try again.'
                        : err.message || 'Login failed. Please try again.';
                    errorMsg.classList.remove('hidden');
                }

                // Reset button
                if (submitBtn) submitBtn.disabled = false;
                if (submitText) submitText.textContent = 'Sign In';
                if (submitSpinner) submitSpinner.classList.add('hidden');
            }
        });
    }
});
