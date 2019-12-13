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
