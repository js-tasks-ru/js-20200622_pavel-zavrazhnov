/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return '';
  }
  if (size === undefined) {
    return string;
  }

  const initObject = {
    lastChar: '',
    count: 0,
    result: ''
  };

  const arr = string.split('');

  const obj = arr.reduce((last, item) => {
    if (last.lastChar !== item) { // смена символа
      return {lastChar: item, count: 1, result: last.result + item};
    }

    return {
      lastChar: item,
      count: last.count + 1,
      result: (last.count < size) ? last.result + item : last.result};
  }, initObject);

  return obj.result;
}
