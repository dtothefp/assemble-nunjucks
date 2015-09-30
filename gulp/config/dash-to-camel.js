/**
 * Strips dashes from string and converts the following character to uppercase
 * @param {String} str
 * @param {Boolean} isLib capitalize the first letter if this is a `lib` name
 * @return {String} if string contains dashes they are stripped and following character to uppercase
 */
export default function dashToCamel(str, isLib) {
  const split = str.split('-');

  return split.map((item, i) => {
    if (i !== 0 || isLib) {
      item = item.charAt(0).toUpperCase() + item.slice(1);
    }
    return item;
  }).join('');
}
