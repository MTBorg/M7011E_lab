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

/**
 * Polls a function every interval time, the input function will be called directly
 * when this function is called the fist time
 * @param {Function} fn the function to poll
 * @param {Number} interval the interval between polls
 */
function pollFunc(fn, interval) {
  (function poll() {
    fn();
    setTimeout(poll, interval);
  })();
}
