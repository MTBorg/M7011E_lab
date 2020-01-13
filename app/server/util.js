const API_ADDRESS = process.env.API_ADDRESS || "http://localhost:8080/graphql";
const API_REST_ADDRESS =
  process.env.API_REST_ADDRESS || "http://localhost:8080/api";
const SERVER_PORT = process.env.SERVER_PORT || "3000";

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

module.exports = { getCookie, API_ADDRESS, API_REST_ADDRESS, SERVER_PORT };
