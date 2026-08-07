// =============================
// Login Page — 360eDash
// =============================

document.addEventListener("DOMContentLoaded", () => {

    initPasswordToggle();
    initLoginForm();

});

// =============================
// Show / Hide Password
// =============================

function initPasswordToggle() {

    const toggle = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("loginPassword");

    if (!toggle || !passwordInput) return;

    toggle.addEventListener("click", () => {

        const isHidden = passwordInput.type === "password";

        passwordInput.type = isHidden ? "text" : "password";

        toggle.innerHTML = isHidden
            ? `<i class="fa-regular fa-eye-slash"></i>`
            : `<i class="fa-regular fa-eye"></i>`;

        toggle.setAttribute(
            "aria-label",
            isHidden ? "Hide password" : "Show password"
        );

    });

}

// =============================
// Login Form Handling
// =============================

function initLoginForm() {

    const form = document.getElementById("loginForm");

    if (!form) return;

    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const roleSelect = document.getElementById("loginRole");
    const submitBtn = document.getElementById("loginSubmit");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        clearErrors(form);

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const role = roleSelect.value;

        let hasError = false;

        if (!username) {
            showFieldError(usernameInput, "usernameError", "Username is required");
            hasError = true;
        }

        if (!password) {
            showFieldError(passwordInput, "passwordError", "Password is required");
            hasError = true;
        }

        if (!role) {
            showFieldError(roleSelect, "roleError", "Please select a role");
            hasError = true;
        }

        if (hasError) return;

        setLoading(submitBtn, true);

        try {

            // TODO: replace with a real authentication API call
            await authenticate({ username, password, role });

            sessionStorage.setItem("edash-user", username);
            sessionStorage.setItem("edash-role", role);
            sessionStorage.setItem("edash-login-time", Date.now().toString()); // 

            window.location.href = "../index.html";

        } catch (err) {

            showGeneralError(form, err.message || "Invalid username, password, or role");

        } finally {

            setLoading(submitBtn, false);

        }

    });

}

// =============================
// Placeholder Auth Call
// =============================

function authenticate({ username, password, role }) {

    // TODO: static test credentials for now.
    // Replace this function's body with a fetch() call to the real login backend.
    const TEST_ACCOUNTS = [
        { username: "admin", password: "123", role: "admin360" }
    ];

    return new Promise((resolve, reject) => {

        setTimeout(() => {

            const match = TEST_ACCOUNTS.find(
                (acc) =>
                    acc.username === username &&
                    acc.password === password &&
                    acc.role === role
            );

            if (match) {
                resolve();
            } else {
                reject(new Error("Invalid username, password, or role"));
            }

        }, 500);

    });

}

// =============================
// Error / Loading Helpers
// =============================

function showFieldError(inputEl, errorId, message) {

    const group = inputEl.closest(".form-group");
    const errorEl = document.getElementById(errorId);

    if (group) group.classList.add("has-error");

    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("is-visible");
    }

}

function showGeneralError(form, message) {

    const errorEl = form.querySelector("#loginError");

    if (!errorEl) return;

    errorEl.textContent = message;
    errorEl.classList.add("is-visible");

}

function clearErrors(form) {

    form.querySelectorAll(".form-group.has-error")
        .forEach((group) => group.classList.remove("has-error"));

    form.querySelectorAll(".form-error")
        .forEach((el) => {
            el.textContent = "";
            el.classList.remove("is-visible");
        });

}

function setLoading(button, isLoading) {

    if (!button) return;

    const label = button.querySelector(".btn-login__label");

    button.disabled = isLoading;

    if (label) label.textContent = isLoading ? "Signing in..." : "Login";

}
/* Apply the persisted dashboard theme on the standalone login page. */
(function applyLoginTheme() {
  const theme = localStorage.getItem('edash-theme') === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
})();
