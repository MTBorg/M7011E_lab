function submitRegisterForm(event, form) {
  event.preventDefault();

  const email = form[0].value;
  const password = form[1].value;
  const managerChecked = form[2].checked;
  const managerPassword = form[3].value;

  const query = managerChecked
    ? `
		mutation {
			registerManager(
				email:"${email}",
				password:"${password}",
				managerPassword: "${managerPassword}"
			)
		}`
    : `mutation{
			registerProsumer(email:"${email}", password:"${password}")
		}`;
  fetch(API_ADDRESS, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query })
  })
    .then(res => res.json())
    .then(res => {
      if (res.errors != null) {
        alert(`Failed to register: ${res.errors[0].message}`);
        return;
      }
      let token = null;
      if (managerChecked) {
        token = res.data.registerManager || null;
      } else {
        token = res.data.registerProsumer || null;
      }
      if (token) {
        document.cookie = `authToken=${token}`;
        window.location.replace("/profile");
      } else {
        alert("Failed to register: Cookie not set");
      }
    })
    .catch(e => alert(`Failed to register: ${e}`));
}
