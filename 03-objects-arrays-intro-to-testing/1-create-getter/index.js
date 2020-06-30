/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return (obj) => path
    .split('.')
    .reduce((result, prop) => (result !== undefined) ? result[prop] : result, obj);
}
