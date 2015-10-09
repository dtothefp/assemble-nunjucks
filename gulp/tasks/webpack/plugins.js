import {join} from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import statsPlugin from './stats-plugin';

export default function(opts) {
  const {
    app,
    environment,
    file,
    isMainTask,
    paths,
    sources,
    release,
    DEBUG,
    SERVER,
    TEST
  } = opts;
  const {scriptDir} = sources;
  const {shouldRev} = environment;
  const {cssBundleName, jsBundleName} = paths;
  const {CommonsChunkPlugin} = webpack.optimize;

  const commons = [
    new CommonsChunkPlugin({
      name: 'vendors',
      filename: join(scriptDir, jsBundleName),
      minChunks: Infinity
    })
  ];

  const plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jquery': 'jquery'
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(DEBUG || TEST ? 'development' : 'production'),
        TEST_FILE: file ? JSON.stringify(file) : null
      }
    })
  ];

  const prodPlugins = [
    new webpack.optimize.DedupePlugin()
  ];

  const releasePlugins = [
    new webpack.BannerPlugin(
      'try{require("source-map-support").install();}\ncatch(err) {}',
      { raw: true, entryOnly: false }
    )
  ];

  function webpackStats() {
    this.plugin('done', (stats) => {
      let statsJson = stats.toJson({
        assets: true,
        hash: true,
        version: false,
        timings: false,
        chunks: false,
        children: false,
        errors: false,
        chunkModules: false,
        modules: false,
        cached: false,
        reasons: false,
        source: false,
        errorDetails: false,
        chunkOrigins: false,
        modulesSort: false,
        chunksSort: false,
        assetsSort: false
      });

      const {assetsByChunkName} = statsJson;

      Object.keys(assetsByChunkName).forEach((key) => {
        console.log(key);
        console.log('*****************', assetsByChunkName[key], '*****************');
      });
    });
  }

  if (!SERVER) {
    plugins.push(
      new ExtractTextPlugin(cssBundleName, {
        allChunks: true
      })
    );

    if (isMainTask) {
      plugins.push(...commons);
    }

    if (shouldRev) {
      prodPlugins.push(statsPlugin(app));
    }

    if (!DEBUG || !TEST) {
      plugins.push(...prodPlugins);
    }

    if (release) {
      plugins.push(...releasePlugins);
    }
  }

  plugins.push(webpackStats);

  return {plugins};
}
