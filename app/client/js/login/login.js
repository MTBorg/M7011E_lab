const API_ADDRESS = "http://localhost:8080/graphql";

function submitLogin(event, form) {
  event.preventDefault();

  let email = form[0].value;
  let password = form[1].value;

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
      let token = res.data.login || null;
      if (token) {
        document.cookie = `authToken=${res.data.login}`;
        window.location.replace("/profile");
      } else {
        alert("Invalid credentials");
      }
    })
    .catch(e => alert(`Failed to login: ${e}`));
}
