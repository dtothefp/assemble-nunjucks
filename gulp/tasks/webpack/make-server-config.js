import {assign} from 'lodash';
import gatherExternals from './gather-commonjs-mods';
import makeWebpackConfig from './make-webpack-config';

export default function({config, entry}) {
  const {sources, utils, pkg} = config;
  const {addbase} = utils;
  const {srcDir, buildDir} = sources;
  const externals = gatherExternals({pkgConfig: pkg, ignore: '@hfa'});
  entry = {
    main: [ '.' + entry.replace(addbase(srcDir), '') ]
  };

  const serverConfig = {
    ENV: 'server',
    output: {
      filename: 'server.[name].js',
      path: addbase(buildDir),
      publicPath: '/',
      libraryTarget: 'commonjs2'
    },
    externals,
    node: {
      console: true,
      process: true,
      global: true,
      Buffer: true,
      __filename: true,
      __dirname: true
    }
  };

  const mergedSources = assign({}, config.sources, {entry});
  assign(serverConfig, {sources: mergedSources});
  const webpackConfig = makeWebpackConfig(assign({}, config, serverConfig));

  return webpackConfig;
}
