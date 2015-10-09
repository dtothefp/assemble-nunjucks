/*eslint-disable*/
module.exports = function() {};
module.exports.pitch = function(req) {
  this.cacheable();
  return 'require(' + JSON.stringify(require.resolve(__dirname + '/style-collector')) + ').add(require(' + JSON.stringify('!!' + req) + '));\n' +
    'delete require.cache[module.id];';
}
/*eslint-enable*/
