const API_ADDRESS = "http://localhost:8080/graphql";

function submitRegisterForm(event, form) {
  event.preventDefault();

  let email = form[0].value;
  let password = form[1].value;

  const query = `
		mutation{
			registerUser(email:"${email}", password:"${password}")
		}
	`;
  fetch(API_ADDRESS, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query })
  })
    .then(res => res.json())
    .then(res => {
      let token = res.data.registerUser || null;
      console.log(res);
      if (token) {
        document.cookie = `authToken=${res.data.registerUser}`;
        window.location.replace("/profile");
      } else {
        alert("Failed to register");
      }
    })
    .catch(e => alert(`Failed to register: ${e}`));
}
