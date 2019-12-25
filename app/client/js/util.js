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
