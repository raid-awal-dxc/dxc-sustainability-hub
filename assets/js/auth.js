
async function handleRegister(e){
	e.preventDefault();
	const email = reg_email.value.trim();
	const password = reg_password.value.trim();
	const fullName = reg_fullname.value.trim();
	const redirect = (window.ENV && window.ENV.AUTH_CONFIRM_REDIRECT) ? window.ENV.AUTH_CONFIRM_REDIRECT : (window.location.origin + '/login.html');
	const { error } = await supabaseClient.auth.signUp({
		email,
		password,
		options: {
			data: { full_name: fullName },
			emailRedirectTo: redirect
		}
	});
	if(error) return alert(error.message);
	alert('Check your email to confirm your account.');
	window.location.href = 'login.html';
}
async function handleLogin(e){ e.preventDefault(); const email=login_email.value.trim(); const password=login_password.value.trim(); const {error}=await supabaseClient.auth.signInWithPassword({email,password}); if(error) return alert(error.message); window.location.href='dashboard.html'; }
async function handleLogout(){ await supabaseClient.auth.signOut(); window.location.href='index.html'; }

// Request a password reset email
async function handleRequestPasswordReset(e){
	if(e && e.preventDefault) e.preventDefault();
	const email = (typeof reset_email !== 'undefined' && reset_email.value) ? reset_email.value.trim() : '';
	if(!email) return alert('Please enter your email address.');
	const redirect = (window.ENV && window.ENV.PASSWORD_RESET_REDIRECT) ? window.ENV.PASSWORD_RESET_REDIRECT : (window.location.origin + '/reset.html');
	const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: redirect });
	if(error) return alert(error.message);
	alert('Check your email for password reset instructions.');
}

// Complete password reset on the redirect page
async function handleCompleteReset(e){
	if(e && e.preventDefault) e.preventDefault();
	const password = (typeof new_password !== 'undefined' && new_password.value) ? new_password.value.trim() : '';
	if(!password || password.length < 6) return alert('Password must be at least 6 characters.');

	// Attempt to consume the session from the URL (Supabase places recovery tokens there)
	try{
		const { data, error } = await supabaseClient.auth.getSessionFromUrl({ storeSession: true });
		if(error && error.message){
			// Not fatal — proceed, updateUser will fail if there's no valid session
			console.warn('getSessionFromUrl:', error.message);
		}
	}catch(err){
		console.warn('getSessionFromUrl threw', err.message || err);
	}

	const { error: updateError } = await supabaseClient.auth.updateUser({ password });
	if(updateError) return alert(updateError.message);
	alert('Password updated. Please sign in.');
	window.location.href = 'login.html';
}
