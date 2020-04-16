var slugify = require('./slugify')
var ensureDir = require('./ensureDir')

module.exports = function(url) {
  if (!url) {
    return undefined;
  }
  // we encode the whole url as filename to avoid overriding files with same file names
  var parts = url.split('.')
  var extension = parts.pop()
  extension = extension.split('?')[0];
  var fileName = slugify(parts.join('.')) + '.' + extension;
  return fileName;
}