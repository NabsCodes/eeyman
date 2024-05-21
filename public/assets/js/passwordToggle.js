document.addEventListener('DOMContentLoaded', () => {
	const togglePasswordDiv = document.querySelector(".toggle-password");
	const togglePasswordText = togglePasswordDiv.querySelector("span");
	const togglePasswordIcon = togglePasswordDiv.querySelector("i");
	const passwordInputs = document.querySelectorAll('input[type="password"]');

	togglePasswordDiv.addEventListener('click', function () {
		passwordInputs.forEach(input => {
			if (input.type === "password") {
				input.type = "text";
			} else {
				input.type = "password";
			}
		});

		if (passwordInputs[0].type === "password") {
			togglePasswordText.textContent = "Show Password";
			togglePasswordIcon.classList.replace('bi-eye-slash', 'bi-eye');
		} else {
			togglePasswordText.textContent = "Hide Password";
			togglePasswordIcon.classList.replace('bi-eye', 'bi-eye-slash');
		}
	});
});