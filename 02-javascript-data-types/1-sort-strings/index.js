/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = 'asc') {
  const sorted = arr.slice().sort((a, b) => {
    return a.localeCompare(b, [], {caseFirst: 'upper'});
  });
  return (param === 'desc') ? sorted.reverse() : sorted;
}
