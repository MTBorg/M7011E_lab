async function updateEmail(event) {
  event.preventDefault();

  const email = document.getElementById("update-email").value;
  try {
    const authToken = getCookie("authToken", document.cookie);
    const response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: { "content-type": "application/json", authToken },
      body: JSON.stringify({
        query: `
				mutation{
					updateEmail(email:"${email}")
				}
			`
      })
    });
    const result = await response.json();

    if (result.errors != null) {
      alert("Failed to update email");
      return;
    }

    const newEmail = result.data.updateEmail;

    // Update the header to show the new email
    document.getElementById("email-header").innerText = newEmail;

    alert("Successfully updated email");
  } catch (error) {
    alert(`Failed to update email: ${error}`);
  }
}
