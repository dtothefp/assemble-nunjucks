import async from 'async';
import glob from 'globby';
import MemoryFS from 'memory-fs';
import webpack from 'webpack';
import makeWebpackConfig from '../webpack/make-webpack-config';

function _transform(config) {
  return function(fp, cb) {
    const fs = new MemoryFS();
    const compiler = webpack({entry: fp});
    compiler.outputFileSystem = fs;
    compiler.run(function(err, stats) {
      if (err) return cb(err);
      const contents = fs.readFileSync(fp);
      cb(null, {path: fp, contents: contents});
    });
  };
}

export default function(config) {
  return function(collection) {
    collection.load = function(patterns, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      options = options || {};
      const files = glob.sync(patterns, options);
      async.map(files, _transform(config), function (err, results) {
        if (err) return cb(err);
        results.forEach(function (file) {
          collection.addView(file.path, file);
        });
        cb();
      });
    };
  };
}
