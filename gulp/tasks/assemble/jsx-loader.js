import async from 'async';
import glob from 'globby';
import MemoryFS from 'memory-fs';
import webpack from 'webpack';
import makeWebpackServerConfig from '../webpack/make-server-config';

export default function(config) {
  const {sources, utils} = config;
  const {buildDir} = sources;
  const {addbase} = utils;

  function _transform(fp, cb) {
    const fs = new MemoryFS();
    const webpackConfig = makeWebpackServerConfig({config, entry: fp});
    const compiler = webpack(webpackConfig);
    compiler.outputFileSystem = fs;
    compiler.run(function(err, stats) {
      if (err) return cb(err);
      const [bundleName] = fs.readdirSync(addbase(buildDir));
      const contents = fs.readFileSync(addbase(buildDir, bundleName));
      cb(null, {path: fp, contents});
    });
  }

  return function(collection) {
    collection.load = function(patterns, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      options = options || {};
      const files = glob.sync(patterns, options);
      async.map(files, _transform, function(err, results) {
        if (err) return cb(err);
        results.forEach(function(file) {
          collection.addView(file.path, file);
        });
        cb();
      });
    };
  };
}
