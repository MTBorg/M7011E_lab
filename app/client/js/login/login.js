function submitLogin(event, form) {
  event.preventDefault();

  const email = form[0].value;
  const password = form[1].value;

  const query = `
		mutation{
			login(email:"${email}", password:"${password}")
		}
	`;
  fetch(API_ADDRESS, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query })
  })
    .then(res => res.json())
    .then(res => {
      const token = res.data.login || null;
      if (token) {
        document.cookie = `authToken=${res.data.login}`;
        window.location.replace("/profile");
      } else {
        alert("Invalid credentials");
      }
    })
    .catch(e => alert(`Failed to login: ${e}`));
}
