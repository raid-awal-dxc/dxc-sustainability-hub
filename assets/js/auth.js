async function handleRegister(e) {
  e.preventDefault();
  const email = reg_email.value.trim();
  const password = reg_password.value.trim();
  const fullName = reg_fullname.value.trim();
  const redirect =
    window.ENV && window.ENV.AUTH_CONFIRM_REDIRECT
      ? window.ENV.AUTH_CONFIRM_REDIRECT
      : window.location.origin + "/login.html";
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: redirect,
    },
  });
  if (error) return alert(error.message);
  // Attempt to enroll the newly created user in all modules. This may
  // run before the user has confirmed email; it's idempotent.
  alert("Check your email to confirm your account.");
  window.location.href = "login.html";
}

function getAllowedEmailDomain() {
  const domain =
    window.ENV && window.ENV.DXC_EMAIL_DOMAIN
      ? window.ENV.DXC_EMAIL_DOMAIN
      : "dxc.com";
  return String(domain).toLowerCase().replace(/^@/, "");
}

function isAllowedDxcEmail(email) {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const allowedDomain = getAllowedEmailDomain();
  return normalized.endsWith(`@${allowedDomain}`);
}

async function handleMicrosoftLogin() {
  const redirectTo =
    window.ENV && window.ENV.OAUTH_REDIRECT
      ? window.ENV.OAUTH_REDIRECT
      : window.location.origin + "/login.html";
  const allowedDomain = getAllowedEmailDomain();
  const rawTenantHint =
    window.ENV && window.ENV.ENTRA_TENANT
      ? String(window.ENV.ENTRA_TENANT).trim()
      : "";
  const hasTenantHint =
    rawTenantHint &&
    rawTenantHint.toLowerCase() !== "organizations" &&
    rawTenantHint.toLowerCase() !== "common";

  const queryParams = {
    domain_hint: allowedDomain,
  };

  if (hasTenantHint) {
    queryParams.tenant = rawTenantHint;
  }

  console.log("Initiating Microsoft login with redirectTo:", redirectTo);
  console.log("Allowed domain:", allowedDomain);
  console.log("Tenant hint:", rawTenantHint);

  const { error, data } = await supabaseClient.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo,
      scopes: "openid profile email",
      queryParams,
    },
  });

  if (error) {
    console.error("OAuth sign-in error:", error);
    return alert(error.message);
  }

  console.log("OAuth sign-in response:", data);
}

function getAuthErrorFromUrl() {
  const readError = (raw) => {
    if (!raw) return null;
    const params = new URLSearchParams(raw.replace(/^#/, ""));
    const code = params.get("error_code") || params.get("error");
    const description = params.get("error_description");
    if (!code && !description) return null;
    return {
      code: code || "oauth_error",
      description: description || "Unexpected authentication error.",
    };
  };

  return readError(window.location.search) || readError(window.location.hash);
}

function handleOAuthCallbackError() {
  const authError = getAuthErrorFromUrl();
  if (!authError) return;

  const decodedDescription = decodeURIComponent(authError.description || "");
  console.error("OAuth callback error:", authError.code, decodedDescription);

  let message = `Sign-in failed (${authError.code}): ${decodedDescription}`;
  if (
    decodedDescription.includes(
      "Error getting user email from external provider",
    )
  ) {
    message =
      "Sign-in failed because Microsoft Entra did not return an email claim. " +
      "In your Entra app registration, add optional ID token claim 'email' and ensure delegated scopes include openid, profile, and email, then grant admin consent.";
  }

  alert(message);

  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

async function enforceDxcEmailAccess() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();
  if (error || !user || !user.email) return;

  if (!isAllowedDxcEmail(user.email)) {
    await supabaseClient.auth.signOut();
    alert(`Only ${getAllowedEmailDomain()} email addresses can sign in.`);
    return;
  }

  if (
    window.location.pathname.toLowerCase().endsWith("/login.html") ||
    window.location.pathname.toLowerCase().endsWith("login.html")
  ) {
    window.location.href = "dashboard.html";
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = login_email.value.trim();
  const password = login_password.value.trim();
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return alert(error.message);
  window.location.href = "dashboard.html";
}
async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

// Request a password reset email
async function handleRequestPasswordReset(e) {
  if (e && e.preventDefault) e.preventDefault();
  const email =
    typeof reset_email !== "undefined" && reset_email.value
      ? reset_email.value.trim()
      : "";
  if (!email) return alert("Please enter your email address.");
  const redirect =
    window.ENV && window.ENV.PASSWORD_RESET_REDIRECT
      ? window.ENV.PASSWORD_RESET_REDIRECT
      : window.location.origin + "/reset.html";
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: redirect,
  });
  if (error) return alert(error.message);
  alert("Check your email for password reset instructions.");
}

// Complete password reset on the redirect page
async function handleCompleteReset(e) {
  if (e && e.preventDefault) e.preventDefault();
  const password =
    typeof new_password !== "undefined" && new_password.value
      ? new_password.value.trim()
      : "";
  if (!password || password.length < 6)
    return alert("Password must be at least 6 characters.");

  // Attempt to consume the session from the URL (Supabase places recovery tokens there)
  try {
    const { data, error } = await supabaseClient.auth.getSessionFromUrl({
      storeSession: true,
    });
    if (error && error.message) {
      // Not fatal — proceed, updateUser will fail if there's no valid session
      console.warn("getSessionFromUrl:", error.message);
    }
  } catch (err) {
    console.warn("getSessionFromUrl threw", err.message || err);
  }

  const { error: updateError } = await supabaseClient.auth.updateUser({
    password,
  });
  if (updateError) return alert(updateError.message);
  alert("Password updated. Please sign in.");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  handleOAuthCallbackError();
  enforceDxcEmailAccess();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) {
      enforceDxcEmailAccess();
      // Ensure the user has enrollments — enroll in all modules if none exist.
      (async () => {
        try {
          const enrolls = await listUserEnrollments(session.user.id);
          if (!enrolls || enrolls.length === 0) {
            await enrollUserInAllModules(session.user.id);
          }
        } catch (err) {
          console.error("ensure enrollments failed:", err?.message || err);
        }
      })();
    }
  });
});
