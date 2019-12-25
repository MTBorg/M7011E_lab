const API_ADDRESS = "http://localhost:8080/graphql";
const API_REST_ADDRESS = "http://localhost:8080/api";

function getCookie(cookie, cookies) {
  if (!cookies) {
    return null;
  }

  // Search for the authentication token in the cookies
  let value = null;
  cookies.split(" ").forEach(c => {
    const [cookieName, cookieValue] = c.split("=");
    if (cookieName === cookie) {
      value = cookieValue;
    }
  });
  return value;
}

function uploadImageFormSubmit(event) {
  event.preventDefault();

  const file = event.target[0].files[0];
  const reader = new FileReader();
  const authToken = getCookie("authToken", document.cookie);
  reader.onload = async e => {
    const image = e.target.result;
    fetch(`${API_REST_ADDRESS}/upload_image`, {
      method: "POST",
      headers: { "content-type": "application/json", authToken },
      body: JSON.stringify({ image })
    })
      .then(res => res.json())
      .then(res => (document.getElementById("image").src = image))
      .catch(error => alert(`Failed to upload image: ${error}`));
  };
  reader.readAsDataURL(file);
}
